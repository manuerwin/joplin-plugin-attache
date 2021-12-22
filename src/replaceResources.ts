import { deleteResource, postResource, executeSync, getResourceByFilename, filesPathSetting, syncConfigured, runOnStartAndAfterSyncSetting } from "./replaceResourcesApi";
import * as path from "path";
import * as fs from "fs-extra";

let step0Dir;
let step1Dir;
let step2Dir;
const regExpResourceId: RegExp = /^[a-zA-Z0-9]{32}$/;
const fileExtReplace = '.REPLACE';
// any length title, resource id, created_time, updated_time with .REPLACE
const regExpFileResourceReplace: RegExp = /^.*~[a-zA-Z0-9]{32}~[0-9]{13}~[0-9]{13}.REPLACE$/;
const fileSeparator = '~';
const step1DirName = "Step 1 - Resource Deleted Sync Needed";
const step2DirName = "Step 2 - Resource Replaced";

export async function init(): Promise<void> {
    console.info(`Attaché plugin started.`);
    step0Dir = await filesPathSetting();
    if (step0Dir?.length > 0) {
        await fs.ensureDir(step0Dir);
        step1Dir = path.join(step0Dir, step1DirName);
        await fs.ensureDir(step1Dir);
        step2Dir = path.join(step0Dir, step2DirName);
        await fs.ensureDir(step2Dir);
        console.info(`Files and directories exist at ${step0Dir}`);
    }
}

export async function deleteResources(): Promise<void> {
    const allFiles = fs.readdirSync(step0Dir);
    let createResourcesProceed = false;
    
    for (const fullNameExt of allFiles) {
        console.debug(`deleteResources: fullNameExt: ${fullNameExt}`);
        let fileExt = path.extname(fullNameExt);
        let filename = path.basename(fullNameExt, fileExt);
        let filePath = path.join(step0Dir, fullNameExt);
        let originalResource;
        let resourceTitle;
        let resourceId;
        let resourceCreatedTime;
        let resourceUpdatedTime;
        let deleteProceed = false;
        let resourceSearchString;

        if ( filename != step1DirName && filename != step2DirName ) {
            if ( regExpResourceId.test(filename) ) {
                console.debug(`deleteResources: filename IS a ResourceId so we will use that to search: ${filename}`);
                resourceSearchString = filename;
                resourceId = filename;
            } else {
                console.debug(`deleteResources: filename NOT a ResourceId, will use fullNameExt to search : ${fullNameExt}`);
                resourceSearchString = fullNameExt;
            }
            try {
                originalResource = await getResourceByFilename(resourceSearchString);
                if (originalResource.items.length == 1) {
                    console.debug(`deleteResources: originalResource.items.length = 1: ${originalResource.items.length}`);
                    resourceTitle = originalResource.items[0].title;
                    resourceId = originalResource.items[0].id;
                    resourceCreatedTime = originalResource.items[0].created_time;
                    resourceUpdatedTime = originalResource.items[0].updated_time;
                    console.info(`Resource found with filename: ${fullNameExt}. Its Resource Id is: ${resourceId}`);
                    console.debug(`resourceCreatedTime: ${resourceCreatedTime}. resourceUpdatedTime: ${resourceUpdatedTime}`);
                    deleteProceed = true;
                } else if (originalResource.items.length > 1) {
                    console.debug(`deleteResources: originalResource.items.length > 1: ${originalResource.items.length}`);
                    console.info(`More than one resource found with filename: ${fullNameExt}. Not proceeding.`);
                } else {
                    console.info(`No resource found with filename: ${fullNameExt}. Not proceeding.`);
                }
            } catch (error) {
                console.error(`ERROR - GET Resource by resourceSearchString: ${resourceSearchString} ${error}`);
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
                    let fileResourceReplace = [resourceTitle, resourceId, resourceCreatedTime, resourceUpdatedTime].join(fileSeparator) + fileExtReplace;
                    console.debug(`deleteResources: fileResourceReplace created: ${fileResourceReplace}`);
                    let fileResourceReplacePath = path.join(step1Dir, fileResourceReplace);
                    fs.ensureFileSync(fileResourceReplacePath);
                    console.debug(`.replace file moved: ${fileResourceReplacePath}`);

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
        console.debug(`deleteResources: createResourcesProceed: ${createResourcesProceed}`);
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
            let fullNameSplit = fullName.split(fileSeparator);
            let resourceTitle = fullNameSplit[0];
            let resourceId = fullNameSplit[1];
            let user_created_time = +fullNameSplit[2];
            let user_updated_time = +fullNameSplit[3];
            let step1DirAndFileReplace = path.join(step1Dir, fullNameExtReplace);
            let step1DirAndFile = path.join(step1Dir, resourceTitle);
            let step2DirAndFile = path.join(step2Dir, resourceTitle);
            
            try {
                console.debug(`about to postResource: ${resourceTitle} with resourceId ${resourceId}`);
                let newResource = await postResource(resourceId, step1DirAndFile, resourceTitle, user_created_time, user_updated_time);
                try {
                    let fileMove = await fs.move(step1DirAndFile, step2DirAndFile);
                    let fileMoveReplace = await fs.removeSync(step1DirAndFileReplace);
                } catch (error) {
                    console.error(`ERROR - moving files to step 2 directory: ${error}`);	
                }   
                console.info(`Resource created, file moved: ${resourceTitle}`);
            } catch (error) {
                console.error(`ERROR - POST Resource: file: ${resourceTitle} with resource id: ${resourceId} ${error}`);
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