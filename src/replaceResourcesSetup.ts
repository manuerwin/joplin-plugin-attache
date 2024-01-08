import joplin from "api";
import { SettingItemType, SettingItemSubType, MenuItemLocation } from "api/types";
import { createResources, deleteResources } from "./replaceResources";

export async function registerSettings(): Promise<void> {
  await joplin.settings.registerSection("AttachéSection", {
    label: "Attaché",
    iconName: "fas fa-exchange-alt",
    description: "Choose the location of files that will replace your resources. Restarting Joplin will create this if doesn't exist.",
  });

  await joplin.settings.registerSettings({
    filesPath: {
      value: "",
      type: SettingItemType.String,
      subType: SettingItemSubType.DirectoryPath,
      section: "AttachéSection",
      public: true,
      label: "",
    },
  });
  
  await joplin.settings.registerSettings({
    runOnStartAndAfterSync: {
      value: false,
      type: SettingItemType.Bool,
      section: "AttachéSection",
      public: true,
      label: "Run on start and after sync",
      description: "If checked true, Attaché will run immediately after Joplin starts and after each synchronisation. The default value is unchecked (false).",
    },
  });
}

export async function registerCommand(): Promise<void> {    
    await joplin.commands.register({
        name: "Attaché",
        label: "Attaché - replace/update attachments",
        execute: async () => {
            await deleteResources();
        }
    });
}

export async function onSyncCompleteEvent(): Promise<void> {
    joplin.workspace.onSyncComplete(async (event: any) => {
        console.debug(`##DEBUG: onSyncComplete event has occurred, about to call createResources`);
        await createResources();
    });
}

export async function createMenuItems(): Promise<void> {
  await joplin.views.menuItems.create(
    "myMenuItemToolsAttaché",
    "Attaché",  
    MenuItemLocation.Tools
    );
  }

export async function createErrorDialog(): Promise<string> {
  let dialog = joplin.views.dialogs;
  let handle = await dialog.create('errorDialog');
  await dialog.setButtons(handle, [
      {
      id: 'Close',
      },
  ]);
  await dialog.setHtml(handle,
      ` <h2>Attaché - Error :(</h2>
      <p>Files Path Setting is missing, cannot proceed!</p> 
      <p>Please configure via Plugin Settings > Attaché > Path :)</p> `);
  return handle;
}

export async function showErrorDialog(handle: string): Promise<void> {
    await joplin.views.dialogs.open(handle);
}