import joplin from 'api';
import { MenuItemLocation } from "api/types";
import { settings } from "./settings";
import * as path from "path";
import * as fs from "fs-extra";

joplin.plugins.register({
	onStart: async function () {
		console.info("Replace Resources plugin started");
	
		await settings.register();

		await joplin.commands.register({
			name: "ReplaceResources",
			label: "Replace Resources",
			execute: async () => {
				const filesPathSetting = await joplin.settings.value("filesPath");
				console.info(`Replace Resources - Files Path Value is ${filesPathSetting}`);
				const allFiles = await fs.readdirSync(filesPathSetting);
				const replacedPath = path.join(filesPathSetting, "replaced");
				const ensureReplacedDirExists = await fs.ensureDir(replacedPath);

				for (const fullNameExt of allFiles) {
					let fileExt = path.extname(fullNameExt);
					let resourceId = path.basename(fullNameExt, fileExt);
					let originalResource;

					let regexpGoodFile: RegExp = /^[a-zA-Z0-9]{32}$/;
					if ( regexpGoodFile.test(resourceId) ) {
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
							console.debug(`Resource found: ${resourceId}`);
						} catch (error) {
							console.debug(`Resource not found: ${resourceId}`);
							console.error(`ERROR - GET Resource: ${resourceId} ${error}`);
						}
						
						if (originalResource) {
							try {
								let resourceDelete = await joplin.data.delete(["resources", resourceId]);
								console.debug(`Resource deleted: ${resourceId}`);
							} catch (error) {
								console.error(`ERROR - DELETE Resource: ${resourceId} ${error}`);
							}
							
							try {
								let filePath = path.join(filesPathSetting, fullNameExt);
								let newResourceData = {
									id: resourceId,
									title: originalResource.title,
									user_created_time: originalResource.created_time,
									user_updated_time: originalResource.updated_time,
								};
								let newResource = await joplin.data.post(
									["resources"],
									null,
									newResourceData,
									[
										{
											path: filePath,
										},
									]
									);
									
									try {
										let replacedPathAndFile = path.join(replacedPath, fullNameExt);
										console.debug(`filePath: ${filePath}`);
										console.debug(`replacedPathAndFile: ${replacedPathAndFile}`);
										let fileMove = await fs.move(filePath, replacedPathAndFile);
									} catch (error) {
										console.error(`ERROR - moving to replaced directory: ${error}`);	
									}
									
								console.info(`Resource replaced: ${resourceId}`);

							} catch (error) {
								console.error(`ERROR - POST Resource: ${resourceId} ${error}`);
							}
						}
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
