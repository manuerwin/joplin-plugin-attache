import joplin from "api";
import { SettingItemType } from "api/types";
import { MenuItemLocation } from "api/types";
import { createResources, deleteResources } from "./replaceResources";

export async function registerSettings() {
    await joplin.settings.registerSection("replaceResourcesSection", {
      label: "Replace Resources",
      iconName: "fas fa-exchange-alt",
    });

    await joplin.settings.registerSettings({
      filesPath: {
        value: "",
        type: SettingItemType.String,
        section: "replaceResourcesSection",
        public: true,
        label: "Files Path",
        description: "Path to files that will replace your resources. Restarting Joplin will create this path if doesn't exist.",
      },
    });
    
    await joplin.settings.registerSettings({
      runOnStartAndAfterSync: {
        value: false,
        type: SettingItemType.Bool,
        section: "replaceResourcesSection",
        public: true,
        label: "Run on start and after sync",
        description: "If checked true, Replace Resources will run immediately after Joplin starts and after each synchronisation. The default value is unchecked (false).",
      },
    });
  }

export async function registerCommand(): Promise<void> {    
    await joplin.commands.register({
        name: "ReplaceResources",
        label: "Replace Resources",
        execute: async () => {
            await deleteResources();
        }
    });
}

export async function onSyncCompleteEvent(): Promise<void> {
    joplin.workspace.onSyncComplete(async (event: any) => {
        console.debug(`onSyncComplete event has occurred, about to call createResources`);
        await createResources();
    });
}

export async function createMenuItems(): Promise<void> {
    await joplin.views.menuItems.create(
        "myMenuItemToolsReplaceResources",
        "ReplaceResources",  
        MenuItemLocation.Tools
    );
}