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
				console.debug(`filesPathValue is ${filesPathValue}`);
				const fullFileNames = await fs.readdirSync(filesPathValue);

				// for (const fullNameExt of fullFileNames) {
				// 	console.debug(`fullNameExt is ${fullNameExt}`);
				// };

				for (const fullNameExt of fullFileNames) {
					console.debug(`fullNameExt is ${fullNameExt}`);

					let fileExt = path.extname(fullNameExt);
					console.debug(`fileExt is ${fileExt}`);
					let resourceId = path.basename(fullNameExt, fileExt);
					console.debug(`resourceId is ${resourceId}`);
					console.debug(`typeof resourceId is: ` + typeof(resourceId) );
					console.debug(`resourceId.length is: ` + resourceId.length );

					if (resourceId !== ".DS_Store") {					
						try {
							const originalResource = await joplin.data.get(["resources", resourceId], {
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
						} catch (error) {
							console.error(`GET on resources: ${error}`);
						}
						
						// if (originalResource) {
						// 	//console.debug("originalResource.id: " + originalResource.id);
						// 	console.debug("originalResource: " + originalResource);
							
						// 	const resourceDelete = await joplin.data.delete(["resources", resourceId]);

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
						// }	
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
