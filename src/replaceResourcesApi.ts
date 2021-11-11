import joplin from "api";
import * as path from "path";

export async function getResource(resourceId: string): Promise<any> {
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

export async function deleteResource(resourceId: string): Promise<void> {
    return await joplin.data.delete(["resources", resourceId]);
}

export async function postResource(resourceId: string, pathToFile: string, fullFileNameExt: string, title?: string): Promise<any> {
    let dirAndFile = path.join(pathToFile, fullFileNameExt);
    let resourceTitle = (title) ? title : "";

    return await joplin.data.post(
        ["resources"],
        null,
        { id: resourceId, title: resourceTitle },
        [
            {
                path: dirAndFile,
            },
        ]
    );
}