import joplin from 'api';
import * as path from "path";
import * as fs from "fs-extra";
import { deleteResource, postResource } from '../src/replaceResourcesApi';
import { execute, init, syncComplete } from '../src/replaceResources';

// jest.mock('postResource');

const testBaseDir = path.join(__dirname, "ReplaceResourcesTest");
const sourceFilesDir = path.join(__dirname, "ReplaceResourcesSourceFiles");
const fileExt = ".png";
const resourceIds = [
  "FilenameDoesNOTMatchExistingId00",
  "FilenameDOESxxxMatchExistingId01",
  "FilenameDOESxxxMatchExistingId02"
]

describe("Replace Resources", function () {
  beforeAll(async () => {
    // console.debug(`BeforeAll: set filesPath and create source files`);
    // try {
      console.debug(`testBaseDir: ${testBaseDir}`);
      // I "think" I need to mock the below, as per the debug it returns a number instead of the desired setting value?
      await joplin.settings.setValue("filesPath", testBaseDir);
      let testBaseDirSettingValue = await joplin.settings.value("filesPath");
      console.debug(`testBaseDirSettingValue: ${testBaseDirSettingValue}`);

      // I "think" I need to mock the below?
    //   await init();

    // } catch (error) {
    //   console.error(`filesPath setting ${testBaseDir} error: ${error}`);
    // }

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
    fs.copySync(sourceFilesDir, testBaseDir)

    for (const resourceId of resourceIds) {
      let newResourceData = {
        id: resourceId,
        title: resourceId,
      };

      let fileX = path.join(testBaseDir, resourceId + fileExt);

      try {
        // I don't think this actually creates a resource? As it's rediected to apiMock.js
        let newResource = await postResource(resourceId, fileX, resourceId);
    } catch (error) {
        console.error(`Test resource creation error: ${error}`);
    }
}
// console.debug(`BeforeEach: Source files copied into test dir and resources created`);
});

afterEach(async () => {
    fs.removeSync(testBaseDir);
    for (const resourceId of resourceIds) {
        try {
        // I don't think this actually creates a resource? As it's rediected to apiMock.js
        let deleteRes = await deleteResource(resourceId);
      } catch (error) {
        console.error(`Test resource delete error: ${error}`);
      }
    }
  });

  afterAll(async () => {
    fs.removeSync(sourceFilesDir);
    // console.debug(`AfterAll: Source files removed`);
  });

  test('Placeholder test until figure out how to mock', async () => {
      expect(true).toEqual(true);
  });

//   test(`Sync IS enabled, file does NOT match existing resource`, async () => {
//       // console.debug(`ENTER: Filename does NOT match existing resource id, should NOT have been moved`);
//       const idNoMatch = "FilenameDoesNotMatchExistingId42";
//       const fileNoMatch = path.join(testBaseDir, idNoMatch + fileExt);
//       fs.writeFileSync(fileNoMatch, "file");
//       expect(fs.existsSync(fileNoMatch)).toBe(true);
      
//       try {
//           //   let replaceExec = await execute();
//           // console.debug(`About to call syncComplete`);
//           // syncComplete();
//         } catch (error) {
//             console.error(`Replace execute error: ${error}`);
//         }
        
//         expect(fs.existsSync(fileNoMatch)).toBe(true);
//         // expect - Error: "Resource not found for filename/id"
//         // expect - File is NOT removed from source folder
//         // expect - Synchronisation does NOT run
//         // expect - New resource is NOT created
//     });
    
    // test(`Sync IS enabled, file DOES match existing resource`, async () => {
//     // console.debug(`ENTER: Filename does match existing resource id, should have been moved`);
//     const idMatch = resourceIds[1];
//     const fileMatch = path.join(testBaseDir, idMatch + fileExt);
//     fs.writeFileSync(fileMatch, "file");
//     expect(fs.existsSync(fileMatch)).toBe(true);

//     try {
//     //   let replaceExec = await execute();
//       // console.debug(`About to call syncComplete`);
//       // syncComplete();
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