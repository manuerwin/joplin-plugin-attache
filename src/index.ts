import joplin from 'api';
import { MenuItemLocation } from "api/types";
import { settings } from "./settings";
import { init, execute, createResources } from './replaceResources';

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
			console.debug(`onSyncComplete event has occurred, about to call createResources`);
			await createResources();
		});

		await joplin.views.menuItems.create(
			"myMenuItemToolsReplaceResources",
			"ReplaceResources",  
		  MenuItemLocation.Tools
		);

		let runOnStart = await joplin.settings.value("runOnStart");
		console.debug(`runOnStart: ${runOnStart}`);
		if (runOnStart) {
			let runOnStartExec = await execute();
		}
	},
});
