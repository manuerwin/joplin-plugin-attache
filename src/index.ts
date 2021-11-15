import joplin from 'api';
import { MenuItemLocation } from "api/types";
import { settings } from "./settings";
import { init, deleteResources, createResources, syncConfiguredAndRunOnStart } from './replaceResources';

joplin.plugins.register({
	onStart: async function () {
		await settings.register();

		await init();

		await joplin.commands.register({
			name: "ReplaceResources",
			label: "Replace Resources",
			execute: async () => {
				await deleteResources();
			}
		});

		joplin.workspace.onSyncComplete(async (event: any) => {
			console.debug(`onSyncComplete event has occurred, about to call createResources`);
			await createResources();
		});
		
		await joplin.views.menuItems.create(
			"myMenuItemToolsReplaceResources",
			"ReplaceResources",  
			MenuItemLocation.Tools
		);
		
		await syncConfiguredAndRunOnStart();
	},
});
