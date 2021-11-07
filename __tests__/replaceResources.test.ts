import joplin from 'api';
import * as path from "path";
import * as fs from "fs-extra";

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
    try {
      await joplin.settings.setValue("filesPath", testBaseDir);
    } catch (error) {
      console.error(`filesPath setting ${testBaseDir} error: ${error}`);
    }

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
        let newResource = await joplin.data.post(
          ["resources"],
          null,
          newResourceData,
          [
            {
              path: fileX,
            },
          ]
          );

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
        let deleteResource = await joplin.data.delete(
          ["resources"],
          resourceId,
        );
      } catch (error) {
        console.error(`Test resource delete error: ${error}`);
      }
    }
    // console.debug(`AfterEach:Test dir and resources removed`);
  });

  afterAll(async () => {
    fs.removeSync(sourceFilesDir);
    // console.debug(`AfterAll: Source files removed`);
  });

  test(`Filename does NOT match existing resource id, should NOT have been moved`, async () => {
    // console.debug(`ENTER: Filename does NOT match existing resource id, should NOT have been moved`);
    const idNoMatch = "FilenameDoesNotMatchExistingId42";
    const fileNoMatch = path.join(testBaseDir, idNoMatch + fileExt);
    fs.writeFileSync(fileNoMatch, "file");
    expect(fs.existsSync(fileNoMatch)).toBe(true);
    
    try {
      //const replaceResources = await joplin.commands.execute('ReplaceResourcesStep1');
      //console.info(`ReplaceResourcesStep1 command successful`);
    } catch (error) {
      console.error(`ReplaceResourcesStep1 command error: ${error}`);
    }
    
    expect(fs.existsSync(fileNoMatch)).toBe(true);
  });
  
  test(`Filename DOES match existing resource id, should have been moved`, async () => {
    // console.debug(`ENTER: Filename does match existing resource id, should have been moved`);
    const idMatch = resourceIds[1];
    const fileMatch = path.join(testBaseDir, idMatch + fileExt);
    fs.writeFileSync(fileMatch, "file");
    expect(fs.existsSync(fileMatch)).toBe(true);

    try {
      //const replaceResources = await joplin.commands.execute('ReplaceResourcesStep1');
      //console.info(`ReplaceResourcesStep1 command successful`);
    } catch (error) {
      console.error(`ReplaceResourcesStep1 command error: ${error}`);
    }

    expect(fs.existsSync(fileMatch)).toBe(false);
  });
});