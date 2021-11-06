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
        description: "Path to the files that will replace your resources.",
      },
    });
  }
}