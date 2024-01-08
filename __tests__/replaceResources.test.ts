import * as path from "path";
import * as fs from "fs-extra";
import { init, deleteResources, createResources, syncConfiguredAndRunOnStart, generateReplaceFileName } from '../src/replaceResources';
import { deleteResource, filesPathSetting, getResourceByFilename, getResourceById, syncConfigured, postResource, putResource, executeSync, runOnStartAndAfterSyncSetting } from '../src/replaceResourcesApi';
import { registerSettings, registerCommand, createMenuItems, onSyncCompleteEvent, createErrorDialog, showErrorDialog } from '../src/replaceResourcesSetup';

const testBaseDir = path.join(__dirname, "ReplaceResourcesTest");
const step2Dir = path.join(testBaseDir, "Step 2 - Resource Replaced");
const sourceFilesDir = path.join(__dirname, "ReplaceResourcesSourceFiles");
const createdTime = 1000000000000;
const fileExt = '.png';
const resourceIdFormat = 'ResourcexxxxIdxxxxFormatxxxx0001';
const resourceIdFormatFilename = resourceIdFormat + fileExt;
const attachmentNameFormat = 'attachmentNameFormat';
const attachmentNameFormatFilename = attachmentNameFormat + fileExt;

interface resourceById {
  id: string;
  title: string;
  user_created_time: number,
};
interface resourceByFileName {
  id: string;
  title: string;
  user_created_time: number;
};
interface apiSearchResult {
  items: resourceByFileName[];
};

jest.mock('../src/replaceResourcesSetup', () => {
  return {
    registerSettings: jest.fn(),
    registerCommand: jest.fn(),
    createMenuItems: jest.fn(),
    onSyncCompleteEvent: jest.fn(),
    createErrorDialog: jest.fn(),
    showErrorDialog: jest.fn(),
  }
});
  
jest.mock('../src/replaceResourcesApi', () => {
  return {
    filesPathSetting: jest.fn(),
    runOnStartAndAfterSyncSetting: jest.fn(),
    syncConfigured: jest.fn(),
    getResourceByFilename: jest.fn(),
    getResourceById: jest.fn(),
    deleteResource: jest.fn(),
    postResource: jest.fn(),
    putResource: jest.fn(),
    executeSync: jest.fn(),
  }
});

describe("Replace Resources", function () {
  
  beforeEach(async () => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    jest.resetAllMocks();
    const mockFilesPathSetting = filesPathSetting as jest.MockedFunction<typeof filesPathSetting>;
    mockFilesPathSetting.mockResolvedValue(testBaseDir);
    let testBaseDirSettingValue = await filesPathSetting();
    expect(testBaseDirSettingValue).toBe(testBaseDir);
    
    fs.emptyDirSync(sourceFilesDir);
    expect(fs.pathExistsSync(sourceFilesDir)).toBe(true);
    fs.emptyDirSync(testBaseDir);
    await init();
  });
  
  afterEach(async () => {
    fs.removeSync(testBaseDir);
  });

  afterAll(async () => {
    fs.removeSync(sourceFilesDir);
  });

  test(`1-Resource Id format does NOT match resource + sync config either enabled or disabled`, async () => {
    console.debug(`#######################TEST-1-Resource Id format does NOT match resource + sync config either enabled or disabled#######################`);
    const filePathExt = path.join(testBaseDir, resourceIdFormatFilename);
    fs.writeFileSync(filePathExt, "file");
    expect(fs.existsSync(filePathExt)).toBe(true);

    const mockgetResource = getResourceById as jest.MockedFunction<typeof getResourceById>;
    mockgetResource.mockImplementation( () => {
      throw new Error();
    });

    await deleteResources();
    expect(getResourceById).toHaveBeenCalledTimes(1);
    expect(getResourceById).toThrowError();
    expect(getResourceByFilename).toHaveBeenCalledTimes(0);
    expect(executeSync).toHaveBeenCalledTimes(0);
    expect(postResource).toHaveBeenCalledTimes(0);
    expect(putResource).toHaveBeenCalledTimes(0);
    expect(fs.existsSync(filePathExt)).toBe(true);
    expect(showErrorDialog).toHaveBeenCalledTimes(0);
  });

  test(`2-Attachment format does NOT match resource + sync config either enabled or disabled`, async () => {
    console.debug(`#######################TEST-2-Attachment format does NOT match resource + sync config either enabled or disabled#######################`);
    const filePathExt = path.join(testBaseDir, attachmentNameFormatFilename);
    fs.writeFileSync(filePathExt, "file");
    expect(fs.existsSync(filePathExt)).toBe(true);

    const mockgetResource = getResourceByFilename as jest.MockedFunction<typeof getResourceByFilename>;
    let itemsReturned = [];
    let resultsReturned: apiSearchResult = {
      items: itemsReturned,
    };
    mockgetResource.mockResolvedValue(resultsReturned);

    await deleteResources();
    expect(getResourceByFilename).toHaveBeenCalledTimes(1);
    expect(getResourceById).toHaveBeenCalledTimes(0);
    expect(executeSync).toHaveBeenCalledTimes(0);
    expect(postResource).toHaveBeenCalledTimes(0);
    expect(putResource).toHaveBeenCalledTimes(0);
    expect(fs.existsSync(filePathExt)).toBe(true);
    expect(showErrorDialog).toHaveBeenCalledTimes(0);
  });

  test(`3-Resource Id format DOES match resource + sync config disabled`, async () => {
    console.debug(`#######################TEST-3-Resource Id format DOES match resource + sync config disabled#######################`);
    const filePathExt = path.join(testBaseDir, resourceIdFormatFilename);
    fs.writeFileSync(filePathExt, "file");
    expect(fs.existsSync(filePathExt)).toBe(true);

    const filePathExtSuccess = path.join(step2Dir, resourceIdFormatFilename);
    const replacefilePathExtSuccess = path.join(step2Dir, generateReplaceFileName(resourceIdFormat, fileExt, resourceIdFormat, resourceIdFormatFilename, createdTime));

    const mockgetResourceById = getResourceById as jest.MockedFunction<typeof getResourceById>;
    let resourceReturned: resourceById = {
      id: resourceIdFormat,
      title: resourceIdFormatFilename,
      user_created_time: createdTime,
    };
    mockgetResourceById.mockResolvedValue(resourceReturned);

    const mockdeleteResource = deleteResource as jest.MockedFunction<typeof deleteResource>;
    mockdeleteResource.mockResolvedValue(true);

    await deleteResources();
    expect(getResourceByFilename).toHaveBeenCalledTimes(0);
    expect(getResourceById).toHaveBeenCalledTimes(1);
    expect(deleteResource).toHaveBeenCalledTimes(1);
    expect(executeSync).toHaveBeenCalledTimes(0);
    expect(postResource).toHaveBeenCalledTimes(1);
    expect(putResource).toHaveBeenCalledTimes(1);
    expect(fs.existsSync(filePathExt)).toBe(false);
    expect(fs.existsSync(filePathExtSuccess)).toBe(true);
    expect(fs.existsSync(replacefilePathExtSuccess)).toBe(true);
    expect(showErrorDialog).toHaveBeenCalledTimes(0);
  });
  
  test(`4-Attachment name format DOES match resource + sync config enabled`, async () => {
    console.debug(`#######################TEST-4-Attachment format DOES match resource + sync config enabled#######################`);
    const filePathExt = path.join(testBaseDir, attachmentNameFormatFilename);
    fs.writeFileSync(filePathExt, "file");
    expect(fs.existsSync(filePathExt)).toBe(true);

    const filePathExtSuccess = path.join(step2Dir, attachmentNameFormatFilename);
    const replacefilePathExtSuccess = path.join(step2Dir, generateReplaceFileName(attachmentNameFormat, fileExt, resourceIdFormat, attachmentNameFormatFilename, createdTime));

    const mockgetResource = getResourceByFilename as jest.MockedFunction<typeof getResourceByFilename>;
    let resourceReturned: resourceByFileName = {
      id: resourceIdFormat,
      title: attachmentNameFormatFilename,
      user_created_time: createdTime,
    };
    let itemsReturned = new Array<resourceByFileName>(resourceReturned);
    let resultsReturned: apiSearchResult = {
      items: itemsReturned,
    };
    mockgetResource.mockResolvedValue(resultsReturned);

    const mockdeleteResource = deleteResource as jest.MockedFunction<typeof deleteResource>;
    mockdeleteResource.mockResolvedValue(true);
    const mocksyncConfigured = syncConfigured as jest.MockedFunction<typeof syncConfigured>;
    mocksyncConfigured.mockResolvedValue(true);

    await deleteResources();
    expect(getResourceById).toHaveBeenCalledTimes(0);
    expect(getResourceByFilename).toHaveBeenCalledTimes(1);
    expect(deleteResource).toHaveBeenCalledTimes(1);
    expect(syncConfigured).toHaveBeenCalledTimes(1);
    expect(executeSync).toHaveBeenCalledTimes(1);
    await createResources();
    expect(postResource).toHaveBeenCalledTimes(1);
    expect(putResource).toHaveBeenCalledTimes(1);
    expect(fs.existsSync(filePathExt)).toBe(false);
    expect(fs.existsSync(filePathExtSuccess)).toBe(true);
    expect(fs.existsSync(replacefilePathExtSuccess)).toBe(true);
    expect(showErrorDialog).toHaveBeenCalledTimes(0);
  });

  test(`5-Attachment name format DOES match resource + sync config enabled + title is null/undefined`, async () => {
    console.debug(`#######################TEST-5-Attachment name format DOES match resource + sync config enabled + title is null/undefined#######################`);
    const filePathExt = path.join(testBaseDir, attachmentNameFormatFilename);
    fs.writeFileSync(filePathExt, "file");
    expect(fs.existsSync(filePathExt)).toBe(true);

    const filePathExtSuccess = path.join(step2Dir, attachmentNameFormatFilename);
    const replacefilePathExtSuccess = path.join(step2Dir, generateReplaceFileName(attachmentNameFormat, fileExt, resourceIdFormat, null, createdTime));

    const mockgetResource = getResourceByFilename as jest.MockedFunction<typeof getResourceByFilename>;
    let resourceReturned: resourceByFileName = {
      id: resourceIdFormat,
      title: '',
      user_created_time: createdTime,
    };
    let itemsReturned = new Array<resourceByFileName>(resourceReturned);
    let resultsReturned: apiSearchResult = {
      items: itemsReturned,
    };
    mockgetResource.mockResolvedValue(resultsReturned);

    const mockdeleteResource = deleteResource as jest.MockedFunction<typeof deleteResource>;
    mockdeleteResource.mockResolvedValue(true);
    const mocksyncConfigured = syncConfigured as jest.MockedFunction<typeof syncConfigured>;
    mocksyncConfigured.mockResolvedValue(true);

    await deleteResources();
    expect(getResourceById).toHaveBeenCalledTimes(0);
    expect(getResourceByFilename).toHaveBeenCalledTimes(1);
    expect(deleteResource).toHaveBeenCalledTimes(1);
    expect(syncConfigured).toHaveBeenCalledTimes(1);
    expect(executeSync).toHaveBeenCalledTimes(1);
    await createResources();
    expect(postResource).toHaveBeenCalledTimes(1);
    expect(putResource).toHaveBeenCalledTimes(1);
    expect(fs.existsSync(filePathExt)).toBe(false);
    expect(fs.existsSync(filePathExtSuccess)).toBe(true);
    expect(fs.existsSync(replacefilePathExtSuccess)).toBe(true);
    expect(showErrorDialog).toHaveBeenCalledTimes(0);
  });

  test(`6-Attachment format DOES match resource + sync config enabled + run on start and after sync enabled`, async () => {
    console.debug(`#######################TEST-6-Attachment format DOES match resource + sync config enabled + run on start and after sync enabled#######################`);
    const filePathExt = path.join(testBaseDir, attachmentNameFormatFilename);
    fs.writeFileSync(filePathExt, "file");
    expect(fs.existsSync(filePathExt)).toBe(true);

    const filePathExtSuccess = path.join(step2Dir, attachmentNameFormatFilename);
    const replacefilePathExtSuccess = path.join(step2Dir, generateReplaceFileName(attachmentNameFormat, fileExt, resourceIdFormat, attachmentNameFormatFilename, createdTime));

    const mockgetResource = getResourceByFilename as jest.MockedFunction<typeof getResourceByFilename>;
    let resourceReturned: resourceByFileName = {
      id: resourceIdFormat,
      title: attachmentNameFormatFilename,
      user_created_time: createdTime,
    };
    let itemsReturned = new Array<resourceByFileName>(resourceReturned);
    let resultsReturned: apiSearchResult = {
      items: itemsReturned,
    };
    mockgetResource.mockResolvedValue(resultsReturned);

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
    expect(getResourceById).toHaveBeenCalledTimes(0);
    expect(getResourceByFilename).toHaveBeenCalledTimes(1);
    expect(deleteResource).toHaveBeenCalledTimes(1);
    expect(syncConfigured).toHaveBeenCalledTimes(2);
    expect(executeSync).toHaveBeenCalledTimes(1);
    await createResources();
    expect(postResource).toHaveBeenCalledTimes(1);
    expect(putResource).toHaveBeenCalledTimes(1);
    expect(fs.existsSync(filePathExt)).toBe(false);
    expect(fs.existsSync(filePathExtSuccess)).toBe(true);
    expect(fs.existsSync(replacefilePathExtSuccess)).toBe(true);
    expect(showErrorDialog).toHaveBeenCalledTimes(0);
  });

  test(`7-ensure replace completes subsequent times without manual removal of files from step 2 directory`, async () => {
    console.debug(`#######################TEST-7-ensure replace completes subsequent times without manual removal of files from step 2 directory#######################`);
    let filePathExt = path.join(testBaseDir, attachmentNameFormatFilename);
    fs.writeFileSync(filePathExt, "file");
    expect(fs.existsSync(filePathExt)).toBe(true);

    const filePathExtSuccess = path.join(step2Dir, attachmentNameFormatFilename);
    const replacefilePathExtSuccess = path.join(step2Dir, generateReplaceFileName(attachmentNameFormat, fileExt, resourceIdFormat, attachmentNameFormatFilename, createdTime));

    const mockgetResource = getResourceByFilename as jest.MockedFunction<typeof getResourceByFilename>;
    let resourceReturned: resourceByFileName = {
      id: resourceIdFormat,
      title: attachmentNameFormatFilename,
      user_created_time: createdTime,
    };
    let itemsReturned = new Array<resourceByFileName>(resourceReturned);
    let resultsReturned: apiSearchResult = {
      items: itemsReturned,
    };
    mockgetResource.mockResolvedValue(resultsReturned);

    const mockdeleteResource = deleteResource as jest.MockedFunction<typeof deleteResource>;
    mockdeleteResource.mockResolvedValue(true);

    await deleteResources();
    expect(getResourceById).toHaveBeenCalledTimes(0);
    expect(getResourceByFilename).toHaveBeenCalledTimes(1);
    expect(deleteResource).toHaveBeenCalledTimes(1);
    await createResources();
    expect(postResource).toHaveBeenCalledTimes(1);
    expect(putResource).toHaveBeenCalledTimes(1);
    expect(fs.existsSync(filePathExt)).toBe(false);
    expect(fs.existsSync(filePathExtSuccess)).toBe(true);
    expect(fs.existsSync(replacefilePathExtSuccess)).toBe(true);

    // Run a second time with the same file, should work without errors
    filePathExt = path.join(testBaseDir, attachmentNameFormatFilename);
    fs.writeFileSync(filePathExt, "file");
    expect(fs.existsSync(filePathExt)).toBe(true);

    await deleteResources();
    expect(getResourceById).toHaveBeenCalledTimes(0);
    expect(getResourceByFilename).toHaveBeenCalledTimes(2);
    expect(deleteResource).toHaveBeenCalledTimes(2);
    await createResources();
    expect(postResource).toHaveBeenCalledTimes(2);
    expect(putResource).toHaveBeenCalledTimes(2);
    expect(fs.existsSync(filePathExt)).toBe(false);
    expect(fs.existsSync(filePathExtSuccess)).toBe(true);
    expect(fs.existsSync(replacefilePathExtSuccess)).toBe(true);

    expect(showErrorDialog).toHaveBeenCalledTimes(0);
  });
  
  test(`8-ensure execution halted and error dialog shows when files path setting empty`, async () => {
    console.debug(`#######################TEST-8-ensure execution halted and error dialog shows when files path setting empty#######################`);
    // await setFilesPathValue('');

    await deleteResources();
    expect(deleteResource).toHaveBeenCalledTimes(0);
    await createResources();
    expect(postResource).toHaveBeenCalledTimes(0);
    expect(putResource).toHaveBeenCalledTimes(0);

    expect(showErrorDialog).toHaveBeenCalled;
  });
  
  test(`9-ensure updated path setting works`, async () => {
    console.debug(`#######################TEST-9-ensure updated path setting works#######################`);
    // await setFilesPathValue('');

    await deleteResources();
    expect(deleteResource).toHaveBeenCalledTimes(0);
    await createResources();
    expect(postResource).toHaveBeenCalledTimes(0);
    expect(putResource).toHaveBeenCalledTimes(0);

    expect(showErrorDialog).toHaveBeenCalled;
  });

});