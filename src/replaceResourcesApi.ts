import joplin from "api";

export async function setFilesPathValue(filesPathValue: string): Promise<void> {
    await joplin.settings.setValue("filesPath", filesPathValue);
}

export async function filesPathSetting(): Promise<string> {   
    return await joplin.settings.value("filesPath");
}

export async function syncTargetGlobalSetting(): Promise<number> {
    return await joplin.settings.globalValue("sync.target");
}

export async function runOnStartAndAfterSyncSetting(): Promise<boolean> {
    return await joplin.settings.value("runOnStartAndAfterSync");
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

export async function getResourceByFilename(filename: string): Promise<any> {
    return await joplin.data.get(["search"], {
        query: filename,
        type: "resource",
        fields: [
            "id",
            "title",
            "mime",
            "filename",
            "file_extension",
            "created_time",
            "updated_time",
        ],
    });
}

export async function deleteResource(resourceId: string): Promise<any> {
    return await joplin.data.delete(["resources", resourceId]);
}

export async function postResource(resourceId: string, pathToFile: string, title: string): Promise<any> {
    let resourceTitle = (title) ? title : "";

    return await joplin.data.post(
        ["resources"],
        null,
        { id: resourceId, title: resourceTitle },
        [
            {
                path: pathToFile,
            },
        ]
    );
}

export async function executeSync(): Promise<void> {
    joplin.commands.execute('synchronize');
}