import joplin from 'api';
import { MenuItemLocation } from "api/types";
import { settings } from "./settings";
import * as path from "path";
import * as fs from "fs-extra";

joplin.plugins.register({
	onStart: async function () {
		console.info("Replace Resources plugin started");
	
		await settings.register();
	
		// function here if needed

		await joplin.commands.register({
			name: "ReplaceResources",
			label: "Replace Resources",
			execute: async () => {
				const filesPathValue = await joplin.settings.value("filesPath");
				console.info(`Replace Resources - Files Path Value is ${filesPathValue}`);
				const fullFileNames = await fs.readdirSync(filesPathValue);

				// for (const fullNameExt of fullFileNames) {
				// 	console.debug(`fullNameExt is ${fullNameExt}`);
				// };

				for (const fullNameExt of fullFileNames) {
					let fileExt = path.extname(fullNameExt);
					let resourceId = path.basename(fullNameExt, fileExt);
					let originalResource;
					// console.debug(`resourceId: ${resourceId}`);

					// TODO - use Regex to match 32 hex names  ^[a-zA-Z0-9]{32}$
					if (resourceId !== ".DS_Store") {
						try {
							originalResource = await joplin.data.get(["resources", resourceId], {
								fields: [
									"id",
									"title",
									"mime",
									"filename",
									"file_extension",
									"created_time",
									"updated_time",
								],
							});
							console.info(`Resource found: ${resourceId}`);
						} catch (error) {
							console.error(`ERROR - GET Resource: ${resourceId} ${error}`);
						}
						
						if (originalResource) {
							try {
								let resourceDelete = await joplin.data.delete(["resources", resourceId]);
								console.debug(`Resource deleted: ${originalResource.id}`);
								// move file to "resource-deleted" sub-folder

							} catch (error) {
								console.error(`ERROR - DELETE Resource: ${resourceId} ${error}`);
							}

						// 	// create resource with id
						// 	// const newResourceData = {
						// 	// 	id: resourceId,
						// 	// 	//user_created_time: resourceCreatedTime,
						// 	// 	//user_updated_time: resourceUpdatedTime,
						// 	// 	title: resourceTitle
						// 	// };
						// 	// const newNote = await joplin.data.post(["notes"], null, newResourceData);
			
						// 	// move file to "replaced" sub-folder
						// 	// else, log error to console that resouce does not exist
						}
						//await joplin.commands.execute("openNote", newNote.id);
					}
				};
			},
		});
	
		await joplin.views.menuItems.create(
		  "myMenuItemToolsReplaceResources",
		  "ReplaceResources",
		  MenuItemLocation.Tools
		);
	},
});
