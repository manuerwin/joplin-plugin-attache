import { getResource, deleteResource, postResource } from "./replaceResourcesApi";
import joplin from "api";
import * as path from "path";
import * as fs from "fs-extra";
// jest.mock(Joplin)

let step0Dir;
let step1Dir;
let step2Dir;
const regexpGoodFile: RegExp = /^[a-zA-Z0-9]{32}$/;
const inProgressLockFileName = 'ReplaceInProgress.lock';

export async function init(): Promise<void> {
    step0Dir = await joplin.settings.value("filesPath");
    await fs.ensureDir(step0Dir);
    step1Dir = path.join(step0Dir, "Step 1 - Resource Deleted Sync Needed");
    await fs.ensureDir(step1Dir);
    step2Dir = path.join(step0Dir, "Step 2 - Resource Replaced");
    await fs.ensureDir(step2Dir);
    console.info(`Replace Resources plugin started, files and directories exist at ${step0Dir}`);
}

export async function execute(): Promise<void> {
    const allFiles = fs.readdirSync(step0Dir);
    
    for (const fullNameExt of allFiles) {
        let fileExt = path.extname(fullNameExt);
        let resourceId = path.basename(fullNameExt, fileExt);
        let filePath = path.join(step0Dir, fullNameExt);
        let originalResource;

        if ( regexpGoodFile.test(resourceId) ) {
            try {
                originalResource = await getResource(resourceId);
            } catch (error) {
                console.error(`ERROR - GET Resource: ${resourceId} ${error}`);
            }

            if (originalResource) {
                try {
                    let deleteResourceStatus = await deleteResource(resourceId);
                } catch (error) {
                    console.error(`ERROR - DELETE Resource: ${resourceId} ${error}`);
                }
            }
            
            try {
                let step1DirAndFile = path.join(step1Dir, fullNameExt);
                let fileMove = await fs.move(filePath, step1DirAndFile);
                console.info(`Resource deleted, file moved: ${resourceId}`);
            } catch (error) {
                console.error(`ERROR - moving to replaced directory: ${error}`);
            }
        }
    };
    
    try {
        console.info(`Running Synchronise for you - do NOT cancel!`);
        const inProgressLockFile = path.join(step1Dir, inProgressLockFileName);
        fs.ensureFileSync(inProgressLockFile);
        joplin.commands.execute('synchronize');	
    } catch (error) {
        console.error(`ERROR - synchronise: ${error}`);
    }
}

export async function syncComplete() {
    const inProgressLockFile = path.join(step1Dir, inProgressLockFileName);
    const inProgressLockFileExists = fs.pathExistsSync(inProgressLockFile);

    if (inProgressLockFileExists) {
        const allStep1Files = await fs.readdirSync(step1Dir);

        for (const fullNameExt of allStep1Files) {
            let fileExt = path.extname(fullNameExt);
            let resourceId = path.basename(fullNameExt, fileExt);
            let step1DirAndFile = path.join(step1Dir, fullNameExt);

            if ( regexpGoodFile.test(resourceId) ) {
                try {
                    let newResource = await postResource(resourceId, step1Dir, fullNameExt);
                        
                    try {
                        let step2DirAndFile = path.join(step2Dir, fullNameExt);
                        let fileMove = await fs.move(step1DirAndFile, step2DirAndFile);
                    } catch (error) {
                        console.error(`ERROR - moving to replaced directory: ${error}`);	
                    }
                    
                    console.info(`Resource created, file moved: ${resourceId}`);
                        
                } catch (error) {
                    console.error(`ERROR - POST Resource: ${resourceId} ${error}`);
                }
            }
        }
        fs.removeSync(inProgressLockFile);
    }
}