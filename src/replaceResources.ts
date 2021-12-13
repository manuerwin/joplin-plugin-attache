import { deleteResource, postResource, executeSync, getResourceByFilename, filesPathSetting, syncTargetGlobalSetting, runOnStartAndAfterSyncSetting } from "./replaceResourcesApi";
import * as path from "path";
import * as fs from "fs-extra";

let step0Dir;
let step1Dir;
let step2Dir;
const regExpResourceId: RegExp = /^[a-zA-Z0-9]{32}$/;
const fileResourceExt = '.REPLACE';
const regExpFileResourceReplace: RegExp = /^.*[a-zA-Z0-9]{32}.REPLACE$/;

export async function init(): Promise<void> {
    step0Dir = await filesPathSetting();
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
        let fileExt = path.extname(fullNameExt);
        let filename = path.basename(fullNameExt, fileExt);
        let filePath = path.join(step0Dir, fullNameExt);
        let originalResource;
        let resourceId;
        let deleteProceed = false;

        if ( regExpResourceId.test(filename) ) {
            console.debug(`deleteResources: filename IS a ResourceId so we will attempt to delete it: ${filename}`);
            resourceId = filename;
            deleteProceed = true;
        } else {
            console.debug(`deleteResources: filename NOT a ResourceId, we need the resource id: ${fullNameExt}`);
            try {
                originalResource = await getResourceByFilename(fullNameExt);
                console.debug(`deleteResources: originalResource.items.length: ${originalResource.items.length}`);
                if (originalResource.items.length == 1) {
                    console.debug(`deleteResources: originalResource.items.length = 1: ${originalResource.items.length}`);
                    resourceId = originalResource.items[0].id;
                    console.info(`Resource found with filename: ${fullNameExt}. Its Resource Id is: ${resourceId}`);
                    deleteProceed = true;
                } else if (originalResource.items.length > 1) {
                    console.info(`More than one resource found with filename: ${fullNameExt}. Not proceeding.`);
                } else {
                    console.info(`No resource found with filename: ${fullNameExt}. Not proceeding.`);
                }
            } catch (error) {
                console.error(`ERROR - GET Resource by filename: ${fullNameExt} ${error}`);
            }
        }

        if (deleteProceed) {
            console.debug(`deleteResources: deleteProceed: ${deleteProceed}`);
            try {
                let deleteResourceStatus = await deleteResource(resourceId);

                try {
                    let step1DirAndFile = path.join(step1Dir, fullNameExt);
                    let fileMove = await fs.move(filePath, step1DirAndFile);
                    console.info(`Resource deleted, file moved: ${fullNameExt}`);
                    let fileResourceReplace = fullNameExt +'~'+ resourceId + fileResourceExt;
                    console.debug(`deleteResources: fileResourceReplace: ${fileResourceReplace}`);
                    let fileResourceReplacePath = path.join(step1Dir, fullNameExt +'~'+ resourceId + fileResourceExt);
                    fs.ensureFileSync(fileResourceReplacePath);
                    console.debug(`.replace file created: ${fileResourceReplacePath}`);

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
    const allStep1Files = await fs.readdirSync(step1Dir);
    
    for (const fullNameExtReplace of allStep1Files) {
        
        if ( regExpFileResourceReplace.test(fullNameExtReplace) ) {
            console.debug(`createResources: fullNameExtReplace is a REPLACE file: ${fullNameExtReplace}`)
            
            let fileExt = path.extname(fullNameExtReplace);
            let fullName = path.basename(fullNameExtReplace, fileExt);
            let fullNameSplit = fullName.split('~');
            console.debug(`createResources: fullNameSplit: ${fullNameSplit}`)
            let filenameExt = fullNameSplit[0];
            let resourceId = fullNameSplit[1];
            console.debug(`createResources: filenameExt: ${filenameExt} resourceId: ${resourceId}`)
            let step1DirAndFileReplace = path.join(step1Dir, fullNameExtReplace);
            let step1DirAndFile = path.join(step1Dir, filenameExt);
            let step2DirAndFile = path.join(step2Dir, filenameExt);
            
            try {
                console.debug(`about to postResource: ${filenameExt} with resourceId ${resourceId}`);
                let newResource = await postResource(resourceId, step1DirAndFile, filenameExt);
                try {
                    let fileMove = await fs.move(step1DirAndFile, step2DirAndFile);
                    let fileMoveReplace = await fs.removeSync(step1DirAndFileReplace);
                } catch (error) {
                    console.error(`ERROR - moving files to step 2 directory: ${error}`);	
                }   
                console.info(`Resource created, file moved: ${filenameExt}`);
            } catch (error) {
                console.error(`ERROR - POST Resource: file: ${filenameExt} with resource id: ${resourceId} ${error}`);
            }       
        }
    }

    // Need to wait until after the above has completed
    let isRunOnStartAndAfterSync = await runOnStartAndAfterSyncSetting();
    console.debug(`isRunOnStartAndAfterSync: ${isRunOnStartAndAfterSync}`);
    if (isRunOnStartAndAfterSync) {
        let isRunOnStartAndAfterSyncExec = await deleteResources();
    }

}

export async function syncConfigured(): Promise<boolean> {
    // Per https://joplinapp.org/schema/settings.json
    let syncTargetValue = await syncTargetGlobalSetting();
    console.debug(`syncTargetValue: ${syncTargetValue}`);
    
    if (syncTargetValue > 0) {
        console.debug(`syncTargetValue > 0`);
        return true;
    }
    
    console.debug(`DEFAULT return false`);
    return false;
}

export async function syncConfiguredAndRunOnStart() {
    let isSyncConfigured = await syncConfigured();
    console.debug(`isSyncConfigured: ${isSyncConfigured}`);
    let isRunOnStartAndAfterSync = await runOnStartAndAfterSyncSetting();
    console.debug(`isRunOnStartAndAfterSync: ${isRunOnStartAndAfterSync}`);

    if (!isSyncConfigured && isRunOnStartAndAfterSync) {
        console.debug(`!syncConfigured && runOnStartAndAfterSync`);
    	await deleteResources();
    }
}