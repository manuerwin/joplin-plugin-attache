import { getResourceById, deleteResource, postResource, executeSync, getResourceByFilename } from "./replaceResourcesApi";
import joplin from "api";
import * as path from "path";
import * as fs from "fs-extra";

let step0Dir;
let step1Dir;
let step2Dir;
const regexpResourceId: RegExp = /^[a-zA-Z0-9]{32}$/;
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

export async function deleteResources(): Promise<void> {
    const allFiles = fs.readdirSync(step0Dir);
    let createResourcesProceed = false;
    
    for (const fullNameExt of allFiles) {
        // console.debug(`deleteResources: fullNameExt: ${fullNameExt}`)
        let fileExt = path.extname(fullNameExt);
        let filename = path.basename(fullNameExt, fileExt);
        let filePath = path.join(step0Dir, fullNameExt);
        let originalResource;
        let resourceId;
        let resourceFound = false;

        if ( regexpResourceId.test(filename) ) {
            console.debug(`deleteResources: filename IS a ResourceId: ${filename}`);
            try {
                originalResource = await getResourceById(filename);
                if (originalResource.items.length > 0) {
                    resourceId = originalResource.items[0].id;
                    console.info(`Resource found with id: ${filename}`);
                    resourceFound = true;
                }
            } catch (error) {
                console.error(`ERROR - GET Resource by id: ${filename} ${error}`);
            }
        } else {
            console.debug(`deleteResources: filename NOT a ResourceId: ${fullNameExt}`);
            try {
                originalResource = await getResourceByFilename(fullNameExt);
                if (originalResource.items.length > 0) {
                    resourceId = originalResource.items[0].id;
                    console.info(`Resource found with filename: ${fullNameExt}. Its Resource Id is: ${resourceId}`);
                    resourceFound = true;
                }
            } catch (error) {
                console.error(`ERROR - GET Resource by filename: ${fullNameExt} ${error}`);
            }
        }

        if (resourceFound) {
            console.debug(`deleteResources: resourceFound: ${resourceFound}`);
            try {
                let deleteResourceStatus = await deleteResource(resourceId);

                try {
                    let step1DirAndFile = path.join(step1Dir, fullNameExt);
                    let fileMove = await fs.move(filePath, step1DirAndFile);
                    console.info(`Resource deleted, file moved: ${fullNameExt}`);
                    createResourcesProceed = true;
                } catch (error) {
                    console.error(`ERROR - moving to replaced directory: ${error}`);
                }
            } catch (error) {
                console.error(`ERROR - DELETE Resource: ${resourceId} / ${fullNameExt} ${error}`);
            }
        }
    };

    if (createResourcesProceed) {
        const createResourcesLockFile = path.join(step1Dir, createResourcesFileName);
        fs.ensureFileSync(createResourcesLockFile);
        let isSyncConfigured = false;

        try {
            isSyncConfigured = await syncConfigured();
        } catch (error) {
            console.error(`ERROR - isSyncConfigured: ${error}`);
        }

        if (isSyncConfigured) {
            console.info(`Running Synchronise for you - do NOT cancel!`);
            let startSync = await executeSync();
        } else {
            console.debug(`No need to wait for sync, going straight to createResources`);
            let goToCreateResources = await createResources();
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
            // console.debug(`createResources: fullNameExt: ${fullNameExt}`)
            let fileExt = path.extname(fullNameExt);
            let filename = path.basename(fullNameExt, fileExt);
            let step1DirAndFile = path.join(step1Dir, fullNameExt);
            let originalResource;
            let resourceId;
            let resourceFound = false;
            
            if ( regexpResourceId.test(filename) ) {
                console.debug(`createResources: filename IS a ResourceId: ${filename}`);
                resourceId = filename;
                resourceFound = true;
            } else {
                console.debug(`createResources: filename NOT a ResourceId: ${fullNameExt}`);
                try {
                    originalResource = await getResourceByFilename(fullNameExt);
                    if (originalResource.items.length > 0) {
                        resourceId = originalResource.items[0].Id;
                        console.info(`createResources: Resource found with filename: ${fullNameExt} and resourceId: ${resourceId}`);
                        resourceFound = true;
                    }
                } catch (error) {
                    console.error(`ERROR - GET Resource by filename: ${fullNameExt} ${error}`);
                }
            }
            
            if (resourceFound) {
                console.debug(`createResources: resourceFound: ${resourceFound}`);
                
                try {
                    console.debug(`about to postResource: ${filename}`);
                    let newResource = await postResource(resourceId, step1DirAndFile, fullNameExt);
                } catch (error) {
                    console.error(`ERROR - POST Resource: ${resourceId} ${error}`);
                }
                
                try {
                    let step2DirAndFile = path.join(step2Dir, fullNameExt);
                    let fileMove = await fs.move(step1DirAndFile, step2DirAndFile);
                } catch (error) {
                    console.error(`ERROR - moving to replaced directory: ${error}`);	
                }
                
                console.info(`Resource created, file moved with id: ${resourceId}`);
            }
        }
        fs.removeSync(createResourcesLockFile);
    }

    // Need to wait until after the above has completed
    let isRunOnStartAndAfterSync = await runOnStartAndAfterSync();
    console.debug(`isRunOnStartAndAfterSync: ${isRunOnStartAndAfterSync}`);
    if (isRunOnStartAndAfterSync) {
        let isRunOnStartAndAfterSyncExec = await deleteResources();
    }

}

export async function syncConfigured(): Promise<boolean> {
    // Per https://joplinapp.org/schema/settings.json
    let syncTargetValue = await joplin.settings.globalValue("sync.target");
    console.debug(`syncTargetValue: ${syncTargetValue}`);
    
    if (syncTargetValue > 0) {
        console.debug(`syncTargetValue > 0`);
        return true;
    }
    
    console.debug(`DEFAULT return false`);
    return false;
}

export async function runOnStartAndAfterSync(): Promise<boolean> {
    let runOnStartValue = await joplin.settings.value("runOnStartAndAfterSync");
    console.debug(`runOnStartValue: ${runOnStartValue}`);
    return runOnStartValue;
}

export async function syncConfiguredAndRunOnStart() {
    let isSyncConfigured = await syncConfigured();
    console.debug(`isSyncConfigured: ${isSyncConfigured}`);
    let isRunOnStartAndAfterSync = await runOnStartAndAfterSync();
    console.debug(`isRunOnStartAndAfterSync: ${isRunOnStartAndAfterSync}`);

    if (!isSyncConfigured && isRunOnStartAndAfterSync) {
        console.debug(`!syncConfigured && runOnStartAndAfterSync`);
    	await deleteResources();
    }
}