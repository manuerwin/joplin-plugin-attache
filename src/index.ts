import joplin from 'api';
import { MenuItemLocation } from "api/types";
import { settings } from "./settings";
import * as path from "path";
import * as fs from "fs-extra";

joplin.plugins.register({
	onStart: async function () {
		console.info("Replace Resources plugin started");
	
		await settings.register();
		const step0Dir = await joplin.settings.value("filesPath");
		await fs.ensureDir(step0Dir);
		const step1Dir = path.join(step0Dir, "Step 1 - Resource Deleted Sync Needed");
		await fs.ensureDir(step1Dir);
		const step3Dir = path.join(step0Dir, "Step 3 - Resource Replaced");
		await fs.ensureDir(step3Dir);
		console.info(`Replace Resources - files and processing directories exist at ${step0Dir}`);
		const regexpGoodFile: RegExp = /^[a-zA-Z0-9]{32}$/;
		let originalResource;

		await joplin.commands.register({
			name: "ReplaceResourcesStep1",
			label: "Replace Resources Step 1 - Delete",
			execute: async () => {
				const allFiles = await fs.readdirSync(step0Dir);

				for (const fullNameExt of allFiles) {
					let fileExt = path.extname(fullNameExt);
					let resourceId = path.basename(fullNameExt, fileExt);
					let filePath = path.join(step0Dir, fullNameExt);

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
						}
						
						try {
							let step1DirAndFile = path.join(step1Dir, fullNameExt);
							let fileMove = await fs.move(filePath, step1DirAndFile);
							console.debug(`File moved: ${resourceId}`);
							console.info(`Step 1 - Resource deleted, file moved: ${resourceId}`);
						} catch (error) {
							console.error(`ERROR - moving to replaced directory: ${error}`);	
						}
					}
				};

				// popup message - step 1 complete, now sync, then run step 2
			},
		});

		await joplin.commands.register({
			name: "ReplaceResourcesStep3",
			label: "Replace Resources Step 3 - Create",
			execute: async () => {
				const allStep1Files = await fs.readdirSync(step1Dir);

				for (const fullNameExt of allStep1Files) {
					let fileExt = path.extname(fullNameExt);
					let resourceId = path.basename(fullNameExt, fileExt);
					let step1DirAndFile = path.join(step1Dir, fullNameExt);

					if ( regexpGoodFile.test(resourceId) ) {
						let newResourceData = {
							id: resourceId,
							// title: originalResource.title,
							// user_created_time: originalResource.created_time,
							// user_updated_time: originalResource.updated_time,
						};
						try {
							let newResource = await joplin.data.post(
								["resources"],
								null,
								newResourceData,
								[
									{
										path: step1DirAndFile,
									},
								]
								);
								console.debug(`Resource created: ${resourceId}`);
								
								try {
									let step3DirAndFile = path.join(step3Dir, fullNameExt);
									console.debug(`step1DirAndFile: ${step1DirAndFile}`);
									console.debug(`step3DirAndFile: ${step3DirAndFile}`);
									let fileMove = await fs.move(step1DirAndFile, step3DirAndFile);
									console.debug(`File moved: ${resourceId}`);
								} catch (error) {
									console.error(`ERROR - moving to replaced directory: ${error}`);	
								}
								
							console.info(`Step 3 - Resource created, file moved: ${resourceId}`);
			
						} catch (error) {
							console.error(`ERROR - POST Resource: ${resourceId} ${error}`);
						}	
					};
				};
			},
		});
	
		await joplin.views.menuItems.create(
		  "myMenuItemToolsReplaceResourcesStep1",
		  "ReplaceResourcesStep1",
		  MenuItemLocation.Tools
		);
		await joplin.views.menuItems.create(
		  "myMenuItemToolsReplaceResourcesStep3",
		  "ReplaceResourcesStep3",
		  MenuItemLocation.Tools
		);
	},
});
