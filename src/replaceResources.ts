import joplin from "api";
import { deleteResource, postResource, putResource, executeSync, getResourceByFilename, filesPathSetting, syncConfigured, runOnStartAndAfterSyncSetting, getResourceById } from "./replaceResourcesApi";
import * as path from "path";
import * as fs from "fs-extra";
import { createErrorDialog, showErrorDialog } from "./replaceResourcesSetup";

let baseDir;
let step1Dir;
let step2Dir;
const regExpResourceId: RegExp = /^[a-zA-Z0-9]{32}$/;
const fileExtReplace = '.REPLACE';
// any filename, resource id (32), any title, user_created_time (13) with ~ separator, ending in .REPLACE
const regExpFileResourceReplace: RegExp = /^.*~[a-zA-Z0-9]{32}~.*~[0-9]{13}.REPLACE$/;
const fileSeparator = '~';
const step1DirName = "Step 1 - Resource Deleted Sync Needed";
const step2DirName = "Step 2 - Resource Replaced";
let handle;

export async function init(): Promise<void> {
    console.info(`Attaché plugin started.`);

    handle = await createErrorDialog();

    baseDir = await filesPathSetting();
    if (baseDir?.length > 0) {
        await fs.ensureDir(baseDir);
        step1Dir = path.join(baseDir, step1DirName);
        await fs.ensureDir(step1Dir);
        step2Dir = path.join(baseDir, step2DirName);
        await fs.ensureDir(step2Dir);
        console.info(`Files and directories exist at ${baseDir}`);
    } else {
        console.error('Files Path Setting is missing, cannot proceed!');
        showErrorDialog(handle);
   handle }
}

export async function deleteResources(): Promise<void> {
    baseDir = await filesPathSetting();
    if (baseDir?.length > 0) {
        const allFiles = fs.readdirSync(baseDir);
        let createResourcesProceed = false;
        
        for (const fullNameExt of allFiles) {
            console.debug(`##DEBUG: deleteResources: fullNameExt: ${fullNameExt}`);
            let fileExt = path.extname(fullNameExt);
            let filename = path.basename(fullNameExt, fileExt);
            let filePath = path.join(baseDir, fullNameExt);
            let resourceSearchString;
            let originalResource;
            let resourceId;
            let resourceTitle;
            let resourceUserCreatedTime;

            if ( filename != step1DirName && filename != step2DirName ) {
                try {
                    if ( regExpResourceId.test(filename) ) {
                        console.debug(`##DEBUG: deleteResources: filename IS a ResourceId so we will use that to search: ${filename}`);
                        resourceSearchString = filename;
                        originalResource = await getResourceById(resourceSearchString);
                        if (originalResource) {
                            console.info(`Resource found with id: ${resourceSearchString}. Proceeding.`);
                            resourceId = originalResource?.id;
                            resourceTitle = originalResource?.title;
                            resourceUserCreatedTime = originalResource?.user_created_time;
                        } else {
                            console.info(`No resource found with id: ${resourceSearchString}. Not proceeding.`);
                        }
                    } else {
                        console.debug(`##DEBUG: deleteResources: filename NOT a ResourceId, will use fullNameExt to search : ${fullNameExt}`);
                        resourceSearchString = fullNameExt;
                        originalResource = await getResourceByFilename(resourceSearchString);
                        
                        if (originalResource.items.length == 1) {
                            console.debug(`##DEBUG: deleteResources: originalResource.items.length = 1: ${originalResource.items.length}`);
                            resourceId = originalResource.items[0].id;
                            resourceTitle = originalResource.items[0].title;
                            resourceUserCreatedTime = originalResource.items[0].user_created_time;
                            console.info(`Resource found with search: ${resourceSearchString}. Its Resource Id is: ${resourceId}`);
                            console.debug(`##DEBUG: deleteResources: resourceTitle: ${resourceTitle} & resourceUserCreatedTime: ${resourceUserCreatedTime}`);
                        } else if (originalResource.items.length > 1) {
                            console.debug(`##DEBUG: deleteResources: originalResource.items.length > 1: ${originalResource.items.length}`);
                            console.info(`More than one resource found with search: ${resourceSearchString}. Not proceeding.`);
                        } else {
                            console.info(`No resource found with search: ${resourceSearchString}. Not proceeding.`);
                        }
                    }
                } catch (error) {
                    console.error(`ERROR - GET Resource by search: ${resourceSearchString} ${error}`);
                }
            }

            if ((resourceId) && (resourceUserCreatedTime)) {
                console.debug(`##DEBUG: deleteResources: resourceId ${resourceId}, resourceTitle ${resourceTitle} & resourceUserCreatedTime ${resourceUserCreatedTime} all have values, proceed with delete`);
                let fileResourceReplace = generateReplaceFileName(filename, fileExt, resourceId, resourceTitle, resourceUserCreatedTime);
                console.debug(`##DEBUG: deleteResources: fileResourceReplace: ${fileResourceReplace}`);

                try {
                    let fileResourceReplacePath = path.join(baseDir, fileResourceReplace);
                    fs.ensureFileSync(fileResourceReplacePath);
                    console.info(`.replace audit file created: ${fileResourceReplacePath}`);
                    
                    try {
                        let deleteResourceStatus = await deleteResource(resourceId);
                        console.info(`Resource deleted: ${resourceTitle}`);

                        try {
                            let step1DirAndFile = path.join(step1Dir, fullNameExt);
                            let fileMove = await fs.move(filePath, step1DirAndFile);
                            console.info(`Replacement file moved: ${fullNameExt}`);
                            
                            let step1DirAndFileReplace = path.join(step1Dir, fileResourceReplace);
                            console.debug(`fileResourceReplacePath ${fileResourceReplacePath}`);
                            console.debug(`step1DirAndFileReplace ${step1DirAndFileReplace}`);
                            let fileMoveReplace = await fs.move(fileResourceReplacePath, step1DirAndFileReplace, { overwrite: true });
                            
                            createResourcesProceed = true;
                        } catch (error) {
                            console.error(`ERROR - moving to replaced directory: ${error}`);
                        }
                    } catch (error) {
                        console.error(`ERROR - DELETE Resource: ${resourceId} / ${fullNameExt} ${error}`);
                    }
                } catch (error) {
                    console.error(`ERROR - creating .REPLACE file ${fileResourceReplace}. ${error}`);
                }
            } else {
                console.debug(`##DEBUG: NOT PROCEEDING with delete: deleteResources: resourceId: ${resourceId}, resourceTitle: ${resourceTitle}, resourceUserCreatedTime: ${resourceUserCreatedTime}`);
            }
        };

        if (createResourcesProceed) {
            console.debug(`##DEBUG: deleteResources: createResourcesProceed: ${createResourcesProceed}`);
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
                console.debug(`##DEBUG: No need to wait for sync, going straight to createResources`);
                let goToCreateResources = await createResources();
            }
        } else {
            console.debug(`##DEBUG: deleteResources: createResourcesProceed: ${createResourcesProceed}`);
        }
    } else {
        console.error('Files Path Setting is missing, cannot proceed!');
        showErrorDialog(handle);
    }
}

export async function createResources() {
    baseDir = await filesPathSetting();
    if (baseDir?.length > 0) {
        const allStep1Files = fs.readdirSync(step1Dir);
        
        for (const fullNameExtReplace of allStep1Files) {
            
            if ( regExpFileResourceReplace.test(fullNameExtReplace) ) {
                console.debug(`##DEBUG: createResources: fullNameExtReplace is a REPLACE file: ${fullNameExtReplace}`)
                let fileExt = path.extname(fullNameExtReplace);
                let fullName = path.basename(fullNameExtReplace, fileExt);            
                let fullNameSplit = fullName.split(fileSeparator);
                console.debug(`##DEBUG: createResources: fullNameSplit: ${fullNameSplit}`)
                let filenameExt = fullNameSplit[0];
                let resourceId = fullNameSplit[1];
                let resourceTitle = fullNameSplit[2];
                let resourceUserCreatedTime = +fullNameSplit[3]

                let step1DirAndFileReplace = path.join(step1Dir, fullNameExtReplace);
                let step2DirAndFileReplace = path.join(step2Dir, fullNameExtReplace);
                let step1DirAndFile = path.join(step1Dir, filenameExt);
                let step2DirAndFile = path.join(step2Dir, filenameExt);
                
                try {
                    console.debug(`##DEBUG: about to postResource: ${resourceTitle} with resourceId ${resourceId}`);
                    let post = await postResource(resourceId, step1DirAndFile, resourceTitle);
                    console.debug(`##DEBUG: about to putResource: ${resourceId} with UserCreatedTime ${resourceUserCreatedTime}`);
                    let put = await putResource(resourceId, resourceUserCreatedTime);
                    try {
                        let fileMove = await fs.move(step1DirAndFile, step2DirAndFile, { overwrite: true });
                        let fileMoveReplace = await fs.move(step1DirAndFileReplace, step2DirAndFileReplace, { overwrite: true });
                    } catch (error) {
                        console.error(`ERROR - moving files to step 2 directory: ${error}`);
                    }
                    console.info(`Attachment replaced, file moved with id: ${resourceId}`);
                } catch (error) {
                    console.error(`ERROR - with either POST and PUT Resource: file: ${resourceTitle} with resource id: ${resourceId} ${error}`);
                }
            }
        }

        // Need to wait until after the above has completed
        let isRunOnStartAndAfterSync = await runOnStartAndAfterSyncSetting();
        console.debug(`##DEBUG: isRunOnStartAndAfterSync: ${isRunOnStartAndAfterSync}`);
        if (isRunOnStartAndAfterSync) {
            let isRunOnStartAndAfterSyncExec = await deleteResources();
        }
    } else {
        console.error('Files Path Setting is missing, cannot proceed!');
        showErrorDialog(handle);
    }
}

export async function syncConfiguredAndRunOnStart() {
    baseDir = await filesPathSetting();
    if (baseDir?.length > 0) {
        let isSyncConfigured = await syncConfigured();
        console.debug(`##DEBUG: isSyncConfigured: ${isSyncConfigured}`);
        let isRunOnStartAndAfterSync = await runOnStartAndAfterSyncSetting();
        console.debug(`##DEBUG: isRunOnStartAndAfterSync: ${isRunOnStartAndAfterSync}`);
        
        if (!isSyncConfigured && isRunOnStartAndAfterSync) {
            console.debug(`##DEBUG: !syncConfigured && runOnStartAndAfterSync`);
            await deleteResources();
        }
    } else {
        console.error('Files Path Setting is missing, cannot proceed!');
        showErrorDialog(handle);
    }
}

export function generateReplaceFileName(filename: string, fileExt: string, resourceId: string, resourceTitle: string, resourceUserCreatedTime: any) {
    return [filename + fileExt, resourceId, resourceTitle, resourceUserCreatedTime].join(fileSeparator) + fileExtReplace;
}