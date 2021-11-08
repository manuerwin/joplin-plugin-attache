import joplin from 'api';
import { MenuItemLocation } from "api/types";
import { settings } from "./settings";
import * as path from "path";
import * as fs from "fs-extra";

joplin.plugins.register({
	onStart: async function () {
		await settings.register();
		const step0Dir = await joplin.settings.value("filesPath");
		await fs.ensureDir(step0Dir);
		const step1Dir = path.join(step0Dir, "Step 1 - Resource Deleted Sync Needed");
		await fs.ensureDir(step1Dir);
		const step2Dir = path.join(step0Dir, "Step 2 - Resource Replaced");
		await fs.ensureDir(step2Dir);
		console.info(`Replace Resources plugin started, files and directories exist at ${step0Dir}`);
		const regexpGoodFile: RegExp = /^[a-zA-Z0-9]{32}$/;
		const inProgressLockFileName = 'ReplaceInProgress.lock';
		let originalResource;

		await joplin.commands.register({
			name: "ReplaceResources",
			label: "Replace Resources",
			execute: async () => {
				const allFiles = fs.readdirSync(step0Dir);

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
						} catch (error) {
							console.error(`ERROR - GET Resource: ${resourceId} ${error}`);
						}
						
						if (originalResource) {
							try {
								await joplin.data.delete(["resources", resourceId]);
							} catch (error) {
								console.error(`ERROR - DELETE Resource: ${resourceId} ${error}`);
							}
						}
						
						try {
							let step1DirAndFile = path.join(step1Dir, fullNameExt);
							let fileMove = await fs.move(filePath, step1DirAndFile);
							console.info(`Resource deleted, file moved: ${resourceId}`);
						} catch (error) {
							console.error(`ERROR - moving to replaced directory: ${error}`);
						}
					}
				};
				
				try {
					console.info(`Running Synchronise for you - do NOT cancel!`);
					const inProgressLockFile = path.join(step1Dir, inProgressLockFileName);
					fs.ensureFileSync(inProgressLockFile);
					joplin.commands.execute('synchronize');	
				} catch (error) {
					console.error(`ERROR - synchronise: ${error}`);
				}
			}
		});

		joplin.workspace.onSyncComplete(async (event: any) => {
			const inProgressLockFile = path.join(step1Dir, inProgressLockFileName);
			const inProgressLockFileExists = fs.pathExistsSync(inProgressLockFile);

			if (inProgressLockFileExists) {
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
								
								try {
									let step2DirAndFile = path.join(step2Dir, fullNameExt);
									let fileMove = await fs.move(step1DirAndFile, step2DirAndFile);
								} catch (error) {
									console.error(`ERROR - moving to replaced directory: ${error}`);	
								}
								
								console.info(`Resource created, file moved: ${resourceId}`);
								
						} catch (error) {
							console.error(`ERROR - POST Resource: ${resourceId} ${error}`);
						}
					}
				}
				fs.removeSync(inProgressLockFile);
			}
		});

		await joplin.views.menuItems.create(
			"myMenuItemToolsReplaceResources",
			"ReplaceResources",  
		  MenuItemLocation.Tools
		);
	},
});
