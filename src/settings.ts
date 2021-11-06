import joplin from "api";
import { SettingItemType } from "api/types";

export namespace settings {
  export async function register() {
    await joplin.settings.registerSection("replaceResourcesSection", {
      label: "Replace Resources",
      iconName: "fas fa-layer-group",
    });

    await joplin.settings.registerSettings({
      preserveMetadataCreatedUpdated: {
        value: false,
        type: SettingItemType.Bool,
        section: "replaceResourcesSection",
        public: true,
        label: "Preserve Resource Created and Updated",
        description:
          "Preserve the original resource Created and Updated values in the newly created resources.",
      },

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