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

export async function syncConfigured(): Promise<boolean> {
  // Per https://joplinapp.org/schema/settings.json
  let syncTargetValue = await syncTargetGlobalSetting();
  console.debug(`##DEBUG: syncTargetValue: ${syncTargetValue}`);

  if (syncTargetValue > 0) {
    console.debug(`##DEBUG: syncTargetValue > 0`);
    return true;
  }

  return false;
}

export async function getResourceById(resourceId: string): Promise<any> {
  console.debug(`##DEBUG: getResourceById: resourceId: ${resourceId}`);
  return await joplin.data.get(["resources", resourceId], {
    fields: ["id", "title", "user_created_time"],
  });
}
export async function getResourceByFilename(
  resourceSearchString: string
): Promise<any> {
  console.debug(
    `##DEBUG: getResourceByFilename: resourceSearchString: ${resourceSearchString}`
  );
  return await joplin.data.get(["search"], {
    query: resourceSearchString,
    type: "resource",
    fields: ["id", "title", "user_created_time"],
  });
}

export async function deleteResource(resourceId: string): Promise<any> {
  return await joplin.data.delete(["resources", resourceId]);
}

export async function postResource(
  resourceId: string,
  pathToFile: string,
  resourceTitle: string
): Promise<any> {
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

export async function putResource(
  resourceId: string,
  userCreatedTime: number
): Promise<any> {
  // Per https://joplinapp.org/api/references/plugin_api/classes/joplindata.html
  return await joplin.data.put(["resources", resourceId], null, {
    user_created_time: userCreatedTime,
  });
}

export async function executeSync(): Promise<void> {
  joplin.commands.execute("synchronize");
}
