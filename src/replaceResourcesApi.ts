import joplin from "api";

export async function filesPathSetting(): Promise<string> {   
    return await joplin.settings.value("filesPath");
}

export async function syncTargetGlobalSetting(): Promise<number> {
    return await joplin.settings.globalValue("sync.target");
}

export async function runOnStartAndAfterSyncSetting(): Promise<boolean> {
    return await joplin.settings.value("runOnStartAndAfterSync");
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