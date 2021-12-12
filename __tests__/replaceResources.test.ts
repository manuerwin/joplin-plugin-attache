import joplin from 'api';
import * as path from "path";
import * as fs from "fs-extra";
import { init } from '../src/replaceResources';
import { createMenuItems, onSyncCompleteEvent, registerCommand, registerSettings } from '../src/replaceResourcesSetup';
import { deleteResource, filesPathSetting, postResource, setFilesPathValue } from '../src/replaceResourcesApi';

const testBaseDir = path.join(__dirname, "ReplaceResourcesTest");
const sourceFilesDir = path.join(__dirname, "ReplaceResourcesSourceFiles");
const fileExt = ".png";
const resourceIds = [
  "FilenameDoesNOTMatchExistingId00",
  "FilenameDOESxxxMatchExistingId01",
  "FilenameDOESxxxMatchExistingId02"
]

jest.mock('../src/replaceResourcesApi', () => {
  return {
    setFilesPathValue: jest.fn(),
    filesPathSetting: jest.fn(),
    syncTargetGlobalSetting: jest.fn(),
    runOnStartAndAfterSyncSetting: jest.fn(),
    getResourceByFilename: jest.fn(),
    deleteResource: jest.fn(),
    postResource: jest.fn(),
    executeSync: jest.fn(),
  }
});

jest.mock('../src/replaceResourcesSetup', () => {
  return {
    registerSettings: jest.fn(),
    registerCommand: jest.fn(),
    onSyncCompleteEvent: jest.fn(),
    createMenuItems: jest.fn(),
  }
});

describe("Replace Resources", function () {
  beforeAll(async () => {
    console.debug(`BeforeAll-testBaseDir: ${testBaseDir}`);
    await setFilesPathValue(testBaseDir);
    const mockFilesPathSetting = filesPathSetting as jest.MockedFunction<typeof filesPathSetting>;
    mockFilesPathSetting.mockResolvedValue(testBaseDir);
    let testBaseDirSettingValue = await filesPathSetting();
    console.debug(`BeforeAll-testBaseDirSettingValue: ${testBaseDirSettingValue}`);
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
    fs.emptyDirSync(testBaseDir);
    await init();
    fs.copySync(sourceFilesDir, testBaseDir)
    console.debug(`BeforeEach: Source files copied into test dir`);
  });
  
  afterEach(async () => {
    fs.removeSync(testBaseDir);
    console.debug(`AfterEach: test dir removed`);
  });

  afterAll(async () => {
    fs.removeSync(sourceFilesDir);
    console.debug(`AfterAll: Source files removed`);
  });

  test(`Sync IS enabled, file does NOT match existing resource`, async () => {
      // console.debug(`ENTER: Filename does NOT match existing resource id, should NOT have been moved`);
      const idNoMatch = "FilenameDoesNotMatchExistingId42";
      const fileNoMatch = path.join(testBaseDir, idNoMatch + fileExt);
      fs.writeFileSync(fileNoMatch, "file");
      expect(fs.existsSync(fileNoMatch)).toBe(true);
      
      try {
          //   let replaceExec = await execute();
          // console.debug(`About to call createResources`);
          // createResources();
        } catch (error) {
            console.error(`Replace execute error: ${error}`);
        }
        
        expect(fs.existsSync(fileNoMatch)).toBe(true);
        // expect - Error: "Resource not found for filename/id"
        // expect - File is NOT removed from source folder
        // expect - Synchronisation does NOT run
        // expect - New resource is NOT created
    });
    
    // test(`Sync IS enabled, file DOES match existing resource`, async () => {
//     // console.debug(`ENTER: Filename does match existing resource id, should have been moved`);
//     const idMatch = resourceIds[1];
//     const fileMatch = path.join(testBaseDir, idMatch + fileExt);
//     fs.writeFileSync(fileMatch, "file");
//     expect(fs.existsSync(fileMatch)).toBe(true);

//     try {
//     //   let replaceExec = await execute();
//       // console.debug(`About to call createResources`);
//       // createResources();
//     } catch (error) {
//       console.error(`Replace execute error: ${error}`);
//     }

// Expect - Existing resource is deleted
// Expect - File IS removed from source folder
// Expect - Synchronisation DOES run
// Expect - New Resource IS created with original id

//     expect(fs.existsSync(fileMatch)).toBe(false);
//   });

// test(`Sync is NOT enabled, file DOES match existing resource`, async () => {
    
    // Expect - Existing resource is deleted
    // Expect - File IS removed from source folder
    // Expect - Synchronisation does NOT run
    // Expect - New Resource IS created with original id
// });
});