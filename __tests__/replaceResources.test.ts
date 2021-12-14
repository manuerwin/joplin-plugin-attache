import joplin from 'api';
import * as path from "path";
import * as fs from "fs-extra";
import { init, deleteResources, createResources } from '../src/replaceResources';
// import { createMenuItems, onSyncCompleteEvent, registerCommand, registerSettings } from '../src/replaceResourcesSetup';
import { deleteResource, filesPathSetting, getResourceByFilename, syncConfigured, postResource, setFilesPathValue, executeSync } from '../src/replaceResourcesApi';
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
    // syncConfiguredAndRunOnStart: jest.fn(),

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

  test(`VALID file format does NOT match resource + sync config either enabled or disabled`, async () => {
    const fileName = "FilenameDoesNotMatchExistingId42";
    const filePathExt = path.join(testBaseDir, fileName + fileExt);
    fs.writeFileSync(filePathExt, "file");
    expect(fs.existsSync(filePathExt)).toBe(true);
          
    const mockdeleteResource = deleteResource as jest.MockedFunction<typeof deleteResource>;
    mockdeleteResource.mockImplementation( () => {
      throw new Error();
    });

    await deleteResources();
    // Only called twice for the foldernames
    expect(getResourceByFilename).toHaveBeenCalledTimes(2);
    expect(mockdeleteResource).toThrowError();
    expect(executeSync).toHaveBeenCalledTimes(0);
    expect(postResource).toHaveBeenCalledTimes(0);
    expect(fs.existsSync(filePathExt)).toBe(true);
    // expect - Error: "Resource not found for filename/id"
  });

  test(`INVALID file format does NOT match resource + sync config either enabled or disabled`, async () => {
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
    // Called thrice for the foldernames + the file
    expect(getResourceByFilename).toHaveBeenCalledTimes(3);
    expect(mockdeleteResource).toThrowError();
    expect(executeSync).toHaveBeenCalledTimes(0);
    expect(postResource).toHaveBeenCalledTimes(0);
    expect(fs.existsSync(filePathExt)).toBe(true);
    // expect - Error: "Resource not found for filename/id"
  });

  test(`VALID file format DOES match resource + sync config disabled`, async () => {
    const fileName = "FilenameDOESxxxMatchExistingId01";
    const filePathExt = path.join(testBaseDir, fileName + fileExt);
    fs.writeFileSync(filePathExt, "file");
    expect(fs.existsSync(filePathExt)).toBe(true);
          
    const mockdeleteResource = deleteResource as jest.MockedFunction<typeof deleteResource>;
    mockdeleteResource.mockResolvedValue(true);

    await deleteResources();
    // Only called twice for the foldernames
    expect(getResourceByFilename).toHaveBeenCalledTimes(2);
    expect(deleteResource).toHaveBeenCalledTimes(1);
    expect(executeSync).toHaveBeenCalledTimes(0);
    expect(postResource).toHaveBeenCalledTimes(1);
    expect(fs.existsSync(filePathExt)).toBe(false);
    // expect - Error: "Resource not found for filename/id"
  });
  
  test(`INVALID file format DOES match resource + sync config enabled`, async () => {
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
    console.debug(`itemsReturned: ${itemsReturned}`);
    console.debug(`itemsReturned.length: ${itemsReturned.length}`);
    console.debug(`itemsReturned[0]: ${itemsReturned[0]}`);
    console.debug(`itemsReturned[0].id: ${itemsReturned[0].id}`);

    let resultsReturned: apiSearchResult = {
      items: itemsReturned,
    };
    mockgetResourceByFilename.mockResolvedValue({ resultsReturned });

    const mockdeleteResource = deleteResource as jest.MockedFunction<typeof deleteResource>;
    mockdeleteResource.mockResolvedValue(true);

    await deleteResources();
    // Called thrice for the foldernames
    expect(getResourceByFilename).toHaveBeenCalledTimes(3);
    expect(deleteResource).toHaveBeenCalledTimes(1);
    expect(executeSync).toHaveBeenCalledTimes(1);
    expect(postResource).toHaveBeenCalledTimes(1);
    expect(fs.existsSync(filePathExt)).toBe(false);
    // expect - Error: "Resource not found for filename/id"
  });
});