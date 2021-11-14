import { getResource, deleteResource, postResource, executeSync } from "./replaceResourcesApi";
import joplin from "api";
import * as path from "path";
import * as fs from "fs-extra";

let step0Dir;
let step1Dir;
let step2Dir;
const regexpGoodFile: RegExp = /^[a-zA-Z0-9]{32}$/;
const createResourcesFileName = 'createResources.lock';

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
    let createResourcesProceed = false;
    
    for (const fullNameExt of allFiles) {
        let fileExt = path.extname(fullNameExt);
        let resourceId = path.basename(fullNameExt, fileExt);
        let filePath = path.join(step0Dir, fullNameExt);
        let originalResource;

        if ( regexpGoodFile.test(resourceId) ) {
            try {
                originalResource = await getResource(resourceId);
                console.info(`Resource found with id: ${resourceId}`);

                if (originalResource) {
                    try {
                        let deleteResourceStatus = await deleteResource(resourceId);

                        try {
                            let step1DirAndFile = path.join(step1Dir, fullNameExt);
                            let fileMove = await fs.move(filePath, step1DirAndFile);
                            console.info(`Resource deleted, file moved with id: ${resourceId}`);
                            createResourcesProceed = true;
                        } catch (error) {
                            console.error(`ERROR - moving to replaced directory: ${error}`);
                        }
                    } catch (error) {
                        console.error(`ERROR - DELETE Resource: ${resourceId} ${error}`);
                    }
                }
            } catch (error) {
                console.error(`ERROR - GET Resource: ${resourceId} ${error}`);
            }
        }
    };

    if (createResourcesProceed) {
        // IF sync is configured/enabled THEN start sync and do nothing else
        // IF sync is NOT enabled THEN go to createResources
        try {
            console.info(`Running Synchronise for you - do NOT cancel!`);
            const createResourcesLockFile = path.join(step1Dir, createResourcesFileName);
            fs.ensureFileSync(createResourcesLockFile);
            let startSync = await executeSync();
        } catch (error) {
            console.error(`ERROR - synchronise: ${error}`);
        }
    }
}

export async function createResources() {
    const createResourcesLockFile = path.join(step1Dir, createResourcesFileName);
    const createResourcesLockFileExists = fs.pathExistsSync(createResourcesLockFile);
    
    if (createResourcesLockFileExists) {
        console.debug(`createResourcesLockFileExists: ${createResourcesLockFileExists}`);
        const allStep1Files = await fs.readdirSync(step1Dir);
        
        for (const fullNameExt of allStep1Files) {
            let fileExt = path.extname(fullNameExt);
            let resourceId = path.basename(fullNameExt, fileExt);
            let step1DirAndFile = path.join(step1Dir, fullNameExt);
            
            if ( regexpGoodFile.test(resourceId) ) {
                try {
                    console.debug(`about to postResource: ${resourceId}`);
                    let newResource = await postResource(resourceId, step1DirAndFile);
                        
                    try {
                        let step2DirAndFile = path.join(step2Dir, fullNameExt);
                        let fileMove = await fs.move(step1DirAndFile, step2DirAndFile);
                    } catch (error) {
                        console.error(`ERROR - moving to replaced directory: ${error}`);	
                    }
                    
                    console.info(`Resource created, file moved with id: ${resourceId}`);
                        
                } catch (error) {
                    console.error(`ERROR - POST Resource: ${resourceId} ${error}`);
                }
            }
        }
        fs.removeSync(createResourcesLockFile);
    }

    // Need to wait until after the above has completed
    let runOnStartAndAfterSync = await joplin.settings.value("runOnStartAndAfterSync");
    console.debug(`runOnStartAndAfterSync: ${runOnStartAndAfterSync}`);
    if (runOnStartAndAfterSync) {
        let runOnStartAndAfterSyncExec = await execute();
    }

}