import joplin from "api";
import * as path from "path";

export async function getResourceById(resourceId: string): Promise<any> {
    return await joplin.data.get(["resources", resourceId], {
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
export async function getResourceByFilename(filename: string): Promise<any> {
    return await joplin.data.get(["resources", filename], {
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