import joplin from "api";
import { SettingItemType } from "api/types";

export namespace settings {
  export async function register() {
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
}