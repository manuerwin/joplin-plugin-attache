import joplin from 'api';
import * as path from "path";
import * as fs from "fs-extra";
import { init, deleteResources, createResources, syncConfiguredAndRunOnStart } from '../src/replaceResources';
import { deleteResource, filesPathSetting, getResourceByFilename, syncConfigured, postResource, setFilesPathValue, executeSync, runOnStartAndAfterSyncSetting } from '../src/replaceResourcesApi';
import { string } from 'yargs';

const testBaseDir = path.join(__dirname, "ReplaceResourcesTest");
const sourceFilesDir = path.join(__dirname, "ReplaceResourcesSourceFiles");
const fileExt = ".png";
const resourceIds = [
  "FilenameDOESxxxMatchExistingId01",
  "FilenameDOESxxxMatchExistingId02"
]

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
    
    for (const resourceId of resourceIds) {
      let fileX = path.join(sourceFilesDir, resourceId + fileExt);
      fs.writeFileSync(fileX, "file");
      expect(fs.existsSync(fileX)).toBe(true);   
    }
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
    console.debug(`#######################DEBUG:TEST-1:#######################`);
    const fileName = "FilenameDoesNotMatchExistingId42";
    const filePathExt = path.join(testBaseDir, fileName + fileExt);
    fs.writeFileSync(filePathExt, "file");
    expect(fs.existsSync(filePathExt)).toBe(true);
          
    const mockdeleteResource = deleteResource as jest.MockedFunction<typeof deleteResource>;
    mockdeleteResource.mockImplementation( () => {
      throw new Error();
    });

    await deleteResources();
    expect(getResourceByFilename).toHaveBeenCalledTimes(0);
    expect(mockdeleteResource).toThrowError();
    expect(executeSync).toHaveBeenCalledTimes(0);
    expect(postResource).toHaveBeenCalledTimes(0);
    expect(fs.existsSync(filePathExt)).toBe(true);
    // expect - Error: "Resource not found for filename/id"
  });

  test(`2-INVALID file format does NOT match resource + sync config either enabled or disabled`, async () => {
    console.debug(`#######################DEBUG:TEST-2:#######################`);
    const fileName = "invalidFileFormat";
    const filePathExt = path.join(testBaseDir, fileName + fileExt);
    fs.writeFileSync(filePathExt, "file");
    expect(fs.existsSync(filePathExt)).toBe(true);
    
    const mockgetResourceByFilename = getResourceByFilename as jest.MockedFunction<typeof getResourceByFilename>;
    mockgetResourceByFilename.mockResolvedValue(null);

    const mockdeleteResource = deleteResource as jest.MockedFunction<typeof deleteResource>;
    mockdeleteResource.mockImplementation( () => {
      throw new Error();
    });

    await deleteResources();
    expect(getResourceByFilename).toHaveBeenCalledTimes(1);
    expect(mockdeleteResource).toThrowError();
    expect(executeSync).toHaveBeenCalledTimes(0);
    expect(postResource).toHaveBeenCalledTimes(0);
    expect(fs.existsSync(filePathExt)).toBe(true);
    // expect - Error: "Resource not found for filename/id"
  });

  test(`3-VALID file format DOES match resource + sync config disabled`, async () => {
    console.debug(`#######################DEBUG:TEST-3:#######################`);
    const fileName = "FilenameDOESxxxMatchExistingId01";
    const filePathExt = path.join(testBaseDir, fileName + fileExt);
    fs.writeFileSync(filePathExt, "file");
    expect(fs.existsSync(filePathExt)).toBe(true);
          
    const mockdeleteResource = deleteResource as jest.MockedFunction<typeof deleteResource>;
    mockdeleteResource.mockResolvedValue(true);

    await deleteResources();
    expect(getResourceByFilename).toHaveBeenCalledTimes(0);
    expect(deleteResource).toHaveBeenCalledTimes(1);
    expect(executeSync).toHaveBeenCalledTimes(0);
    expect(postResource).toHaveBeenCalledTimes(1);
    expect(fs.existsSync(filePathExt)).toBe(false);
    // expect - Error: "Resource not found for filename/id"
  });
  
  test(`4-INVALID file format DOES match resource + sync config enabled`, async () => {
    console.debug(`#######################DEBUG:TEST-4:#######################`);
    const fileName = "invalidFileFormatDOESmatch";
    const filePathExt = path.join(testBaseDir, fileName + fileExt);
    fs.writeFileSync(filePathExt, "file");
    expect(fs.existsSync(filePathExt)).toBe(true);

    const mockgetResourceByFilename = getResourceByFilename as jest.MockedFunction<typeof getResourceByFilename>;
    interface resourceByFileName {
      id: string;
    };
    interface apiSearchResult {
      items: resourceByFileName[];
    };
    let resourceReturned: resourceByFileName = {
      id: 'FilenameDOESxxxMatchExistingId02'
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
    // expect - Error: "Resource not found for filename/id"
  });

  test(`5-INVALID file format DOES match resource + sync config enabled + run on start and after sync enabled`, async () => {
    console.debug(`#######################DEBUG:TEST-5:#######################`);
    const fileName = "invalidFileFormatDOESmatch";
    const filePathExt = path.join(testBaseDir, fileName + fileExt);
    fs.writeFileSync(filePathExt, "file");
    expect(fs.existsSync(filePathExt)).toBe(true);

    const mockgetResourceByFilename = getResourceByFilename as jest.MockedFunction<typeof getResourceByFilename>;
    interface resourceByFileName {
      id: string;
    };
    interface apiSearchResult {
      items: resourceByFileName[];
    };
    let resourceReturned: resourceByFileName = {
      id: 'FilenameDOESxxxMatchExistingId02'
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
    expect(getResourceByFilename).toHaveBeenCalledTimes(1);
    expect(deleteResource).toHaveBeenCalledTimes(1);
    expect(syncConfigured).toHaveBeenCalledTimes(2);
    expect(executeSync).toHaveBeenCalledTimes(1);
    expect(postResource).toHaveBeenCalledTimes(1);
    expect(fs.existsSync(filePathExt)).toBe(false);
    // expect - Error: "Resource not found for filename/id"
  });

});