import joplin from "api";
import { init, syncConfiguredAndRunOnStart } from "./replaceResources";
import {
  createMenuItems,
  onSyncCompleteEvent,
  registerSettings,
  registerCommand,
} from "./replaceResourcesSetup";

joplin.plugins.register({
  onStart: async function () {
    console.log("onStart Attaché plugin");
    await registerSettings();
    await registerCommand();
    await createMenuItems();
    await init();
    await onSyncCompleteEvent();
    await syncConfiguredAndRunOnStart();
  },
});
