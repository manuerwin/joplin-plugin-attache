import joplin from 'api';
import { MenuItemLocation } from "api/types";
import { settings } from "./settings";
import { init, execute, syncComplete } from './replaceResources';
import * as path from "path";

joplin.plugins.register({
	onStart: async function () {
		await settings.register();

		await init();

		await joplin.commands.register({
			name: "ReplaceResources",
			label: "Replace Resources",
			execute: async () => {
				await execute();
			}
		});

		joplin.workspace.onSyncComplete(async (event: any) => {
			await syncComplete();
		});

		await joplin.views.menuItems.create(
			"myMenuItemToolsReplaceResources",
			"ReplaceResources",  
		  MenuItemLocation.Tools
		);
	},
});
