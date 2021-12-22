import joplin from 'api';
import * as path from "path";
import * as fs from "fs-extra";
import { init, deleteResources, createResources, syncConfiguredAndRunOnStart } from '../src/replaceResources';
import { deleteResource, filesPathSetting, getResourceByFilename, syncConfigured, postResource, setFilesPathValue, executeSync, runOnStartAndAfterSyncSetting } from '../src/replaceResourcesApi';
import { string } from 'yargs';

const testBaseDir = path.join(__dirname, "ReplaceResourcesTest");
const step1Dir = path.join(testBaseDir, "Step 1 - Resource Deleted Sync Needed");
const sourceFilesDir = path.join(__dirname, "ReplaceResourcesSourceFiles");
const fileExt = ".png";
const fileExtReplace = '.REPLACE';
const fileSeparator = '~';
const resourceIds = [
  "FilenameDOESxxxMatchExistingId01",
  "FilenameDOESxxxMatchExistingId02"
]
const createdTime = 1000000000000;
const updatedTime = 1640062082755;

interface resourceByFileName {
  title: string;
  id: string;
  created_time: number;
  updated_time: number;
};
interface apiSearchResult {
  items: resourceByFileName[];
};

jest.mock('../src/replaceResourcesSetup', () => {
  return {
    registerSettings: jest.fn(),
    registerCommand: jest.fn(),
    onSyncCompleteEvent: jest.fn(),
    createMenuItems: jest.fn(),
  }
});
  
jest.mock('../src/replaceResourcesApi', () => {
  return {
    setFilesPathValue: jest.fn(),
    filesPathSetting: jest.fn(),
    syncTargetGlobalSetting: jest.fn(),
    runOnStartAndAfterSyncSetting: jest.fn(),
    syncConfigured: jest.fn(),
    getResourceByFilename: jest.fn(),
    deleteResource: jest.fn(),
    postResource: jest.fn(),
    executeSync: jest.fn(),
  }
});

describe("Replace Resources", function () {
  beforeAll(async () => {
    await setFilesPathValue(testBaseDir);
    const mockFilesPathSetting = filesPathSetting as jest.MockedFunction<typeof filesPathSetting>;
    mockFilesPathSetting.mockResolvedValue(testBaseDir);
    let testBaseDirSettingValue = await filesPathSetting();
    expect(testBaseDirSettingValue).toBe(testBaseDir);
    
    fs.emptyDirSync(sourceFilesDir);
    expect(fs.pathExistsSync(sourceFilesDir)).toBe(true);
    
    // for (const resourceId of resourceIds) {
    //   let fileX = path.join(sourceFilesDir, resourceId + fileExt);
    //   fs.writeFileSync(fileX, "file");
    //   expect(fs.existsSync(fileX)).toBe(true);   
    // }
  });
  
  beforeEach(async () => {
    jest.clearAllMocks();
    fs.emptyDirSync(testBaseDir);
    await init();
  });
  
  afterEach(async () => {
    fs.removeSync(testBaseDir);
  });

  afterAll(async () => {
    fs.removeSync(sourceFilesDir);
  });

  test(`1-VALID file format does NOT match resource + sync config either enabled or disabled`, async () => {
    console.debug(`#######################TEST-1-VALID file format does NOT match resource + sync config either enabled or disabled`);
    const fileName = "FilenameDoesNotMatchExistingId42";
    const filePathExt = path.join(testBaseDir, fileName + fileExt);
    fs.writeFileSync(filePathExt, "file");
    expect(fs.existsSync(filePathExt)).toBe(true);

    const mockgetResourceByFilename = getResourceByFilename as jest.MockedFunction<typeof getResourceByFilename>;
    let itemsReturned = [];
    let resultsReturned: apiSearchResult = {
      items: itemsReturned,
    };
    mockgetResourceByFilename.mockResolvedValue(resultsReturned);

    await deleteResources();
    expect(getResourceByFilename).toHaveBeenCalledTimes(1);
    expect(executeSync).toHaveBeenCalledTimes(0);
    expect(postResource).toHaveBeenCalledTimes(0);
    expect(fs.existsSync(filePathExt)).toBe(true);
  });

  test(`2-INVALID file format does NOT match resource + sync config either enabled or disabled`, async () => {
    console.debug(`#######################TEST-2-INVALID file format does NOT match resource + sync config either enabled or disabled`);
    const fileName = "invalidFileFormat";
    const filePathExt = path.join(testBaseDir, fileName + fileExt);
    fs.writeFileSync(filePathExt, "file");
    expect(fs.existsSync(filePathExt)).toBe(true);

    const mockgetResourceByFilename = getResourceByFilename as jest.MockedFunction<typeof getResourceByFilename>;
    let itemsReturned = [];
    let resultsReturned: apiSearchResult = {
      items: itemsReturned,
    };
    mockgetResourceByFilename.mockResolvedValue(resultsReturned);

    await deleteResources();
    expect(getResourceByFilename).toHaveBeenCalledTimes(1);
    expect(executeSync).toHaveBeenCalledTimes(0);
    expect(postResource).toHaveBeenCalledTimes(0);
    expect(fs.existsSync(filePathExt)).toBe(true);
  });

  test(`3-VALID file format DOES match resource + sync config disabled`, async () => {
    console.debug(`#######################TEST-3-VALID file format DOES match resource + sync config disabled`);
    const fileName = "FilenameDOESxxxMatchExistingId01";
    const filePathExt = path.join(testBaseDir, fileName + fileExt);
    fs.writeFileSync(filePathExt, "file");
    expect(fs.existsSync(filePathExt)).toBe(true);

    const mockgetResourceByFilename = getResourceByFilename as jest.MockedFunction<typeof getResourceByFilename>;
    let resourceReturned: resourceByFileName = {
      title: 'FilenameDOESxxxMatchExistingId01.png',
      id: 'FilenameDOESxxxMatchExistingId01',
      created_time: createdTime,
      updated_time: updatedTime
    };
    let itemsReturned = new Array<resourceByFileName>(resourceReturned);
    let resultsReturned: apiSearchResult = {
      items: itemsReturned,
    };
    mockgetResourceByFilename.mockResolvedValue(resultsReturned);

    const mockdeleteResource = deleteResource as jest.MockedFunction<typeof deleteResource>;
    mockdeleteResource.mockResolvedValue(true);

    await deleteResources();
    expect(getResourceByFilename).toHaveBeenCalledTimes(1);
    expect(deleteResource).toHaveBeenCalledTimes(1);
    expect(executeSync).toHaveBeenCalledTimes(0);
    expect(postResource).toHaveBeenCalledTimes(1);
    expect(fs.existsSync(filePathExt)).toBe(false);
  });
  
  test(`4-INVALID file format DOES match resource + sync config enabled`, async () => {
    console.debug(`#######################TEST-4-INVALID file format DOES match resource + sync config enabled`);
    const fileName = "invalidFileFormatDOESmatch";
    const filePathExt = path.join(testBaseDir, fileName + fileExt);
    fs.writeFileSync(filePathExt, "file");
    expect(fs.existsSync(filePathExt)).toBe(true);

    const mockgetResourceByFilename = getResourceByFilename as jest.MockedFunction<typeof getResourceByFilename>;
    let resourceReturned: resourceByFileName = {
      title: 'invalidFileFormatDOESmatch.png',
      id: 'FilenameDOESxxxMatchExistingId42',
      created_time: createdTime,
      updated_time: updatedTime
    };
    let itemsReturned = new Array<resourceByFileName>(resourceReturned);
    let resultsReturned: apiSearchResult = {
      items: itemsReturned,
    };
    mockgetResourceByFilename.mockResolvedValue(resultsReturned);

    const mockdeleteResource = deleteResource as jest.MockedFunction<typeof deleteResource>;
    mockdeleteResource.mockResolvedValue(true);
    const mocksyncConfigured = syncConfigured as jest.MockedFunction<typeof syncConfigured>;
    mocksyncConfigured.mockResolvedValue(true);

    await deleteResources();
    expect(getResourceByFilename).toHaveBeenCalledTimes(1);
    expect(deleteResource).toHaveBeenCalledTimes(1);
    expect(syncConfigured).toHaveBeenCalledTimes(1);
    expect(executeSync).toHaveBeenCalledTimes(1);
    await createResources();
    expect(postResource).toHaveBeenCalledTimes(1);
    expect(fs.existsSync(filePathExt)).toBe(false);
  });

  test(`5-INVALID file format DOES match resource + sync config enabled + run on start and after sync enabled`, async () => {
    console.debug(`#######################TEST-5-INVALID file format DOES match resource + sync config enabled + run on start and after sync enabled`);
    const fileName = "invalidFileFormatDOESmatch";
    const filePathExt = path.join(testBaseDir, fileName + fileExt);
    fs.writeFileSync(filePathExt, "file");
    expect(fs.existsSync(filePathExt)).toBe(true);

    const mockgetResourceByFilename = getResourceByFilename as jest.MockedFunction<typeof getResourceByFilename>;
    let resourceReturned: resourceByFileName = {
      title: 'invalidFileFormatDOESmatch.png',
      id: 'FilenameDOESxxxMatchExistingId42',
      created_time: createdTime,
      updated_time: updatedTime
    };
    let itemsReturned = new Array<resourceByFileName>(resourceReturned);
    let resultsReturned: apiSearchResult = {
      items: itemsReturned,
    };
    mockgetResourceByFilename.mockResolvedValue(resultsReturned);

    const mockdeleteResource = deleteResource as jest.MockedFunction<typeof deleteResource>;
    mockdeleteResource.mockResolvedValue(true);
    const mocksyncConfigured = syncConfigured as jest.MockedFunction<typeof syncConfigured>;
    mocksyncConfigured.mockResolvedValue(true);
    const mockrunOnStartAndAfterSyncSetting = runOnStartAndAfterSyncSetting as jest.MockedFunction<typeof runOnStartAndAfterSyncSetting>;
    mockrunOnStartAndAfterSyncSetting.mockResolvedValue(true);

    await syncConfiguredAndRunOnStart();
    expect(syncConfigured).toHaveBeenCalledTimes(1);
    expect(syncConfigured).toBeTruthy();
    await deleteResources();
    expect(getResourceByFilename).toHaveBeenCalledTimes(1);
    expect(deleteResource).toHaveBeenCalledTimes(1);
    expect(syncConfigured).toHaveBeenCalledTimes(2);
    expect(executeSync).toHaveBeenCalledTimes(1);
    await createResources();
    expect(postResource).toHaveBeenCalledTimes(1);
    expect(fs.existsSync(filePathExt)).toBe(false);
  });

});