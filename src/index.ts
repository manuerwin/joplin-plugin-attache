import joplin from 'api';
import { init, syncConfiguredAndRunOnStart } from './replaceResources';
import { createMenuItems, onSyncCompleteEvent, registerSettings, registerCommand } from './setup';

joplin.plugins.register({
	onStart: async function () {
		await registerSettings();

		await init();

		await registerCommand();

		await onSyncCompleteEvent();
		
		await createMenuItems();
		
		await syncConfiguredAndRunOnStart();
	},
});
