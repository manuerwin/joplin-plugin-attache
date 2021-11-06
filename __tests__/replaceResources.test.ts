import * as fs from "fs-extra";
import * as path from "path";
import joplin from "api";

const testBaseDir = path.join(__dirname, "ReplaceResourcesTest");
const ext = ".png";


describe("Replace Resources", function () {
  beforeAll(async () => {
    await joplin.settings.setValue("filesPath", testBaseDir);
  });

  beforeEach(async () => {

    // insert 3 resources with known ids
    var idX = "";
    var fileX = "";
    fs.emptyDirSync(testBaseDir);
    for (let counter = 0; counter < 3; counter++) {
      idX = counter.toString();
      fileX = path.join(testBaseDir, idX + ext);
      fs.writeFileSync(fileX, "file");
      expect(fs.existsSync(fileX)).toBe(true);   

      const resource = await joplin.data.post(
        ["resources"],
        null,
        { id: idX, title: "test.png" },
        [
          {
            path: fileX,
          },
        ]
      );
    }

    //expect the insert worked....

    // set the hotfolder path setting
    // set the replaceResources boolean setting

  });

  afterEach(async () => {
    fs.removeSync(testBaseDir);
  });

  test(`Filename does not match existing resource id`, async () => {
    const idNoMatch = "noMatch";
    const fileNoMatch = path.join(testBaseDir, idNoMatch + ext);
    fs.emptyDirSync(testBaseDir);
    fs.writeFileSync(fileNoMatch, "file");
    expect(fs.existsSync(fileNoMatch)).toBe(true);

    // call Joplin ReplaceResources

    expect(fs.existsSync(fileNoMatch)).toBe(true);
  });

  test(`Filename does match existing resource id`, async () => {
    const idMatch = "1";
    const fileMatch = path.join(testBaseDir, idMatch + ext);
    fs.emptyDirSync(testBaseDir);
    fs.writeFileSync(fileMatch, "file");
    expect(fs.existsSync(fileMatch)).toBe(true);

    // call Joplin ReplaceResources

    expect(fs.existsSync(fileMatch)).toBe(false);
  });
});