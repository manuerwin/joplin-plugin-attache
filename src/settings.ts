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
        description: "Path to files that will replace your resources. Restart Joplin after setting for automatic creation.",
      },
    });
    
    await joplin.settings.registerSettings({
      runOnStart: {
        value: false,
        type: SettingItemType.Bool,
        section: "replaceResourcesSection",
        public: true,
        label: "Run on start",
        description: "If checked true, Replace Resources will run immediately after Joplin starts. The default value is unchecked (false).",
      },
    });

  }
}