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
				// obtain folder path from settings
				const filesPathValue = await joplin.settings.value("filesPath");
				console.debug("filesPathValue is " + filesPathValue);
				let filesPath = path.parse(filesPathValue);

				// retrieve an array of filenames in folder

				const fileNames = fs.readdirSync(filesPathValue);

				// for each resource id in collection
				fileNames.forEach(fileName => {
					console.debug(fileName);
					//var resourceId
					// if resource exists
					// get properties for duplication
					// resourceCreatedTime
					// resourceUpdatedTime
					// resourceTitle
	
					// delete resource
					//await joplin.data.delete(["resources", resourceId]);
	
					// create resource with id
					// const newResourceData = {
					// 	id: resourceId,
					// 	//user_created_time: resourceCreatedTime,
					// 	//user_updated_time: resourceUpdatedTime,
					// 	title: resourceTitle
					// };
					// const newNote = await joplin.data.post(["notes"], null, newResourceData);
	
					// move file to "replaced" sub-folder
					// else, log error to console that resouce does not exist
	
					// const ids = await joplin.workspace.selectedNoteIds();
					// if (ids.length > 1) {
					//   const newNoteBody = [];
					//   let notebookId = null;
					//   const newTags = [];
					//   let preserveMetadata = [];
					//   const preserveUrl = await joplin.settings.value(
					// 	"preserveMetadataSourceUrl"
					//   );
	
					//   // collect note data
					//   for (const noteId of ids) {
					// 	preserveMetadata = [];
					// 	const note = await joplin.data.get(["notes", noteId], {
					// 	  fields: [
					// 		"title",
					// 		"body",
					// 		"parent_id",
					// 		"source_url",
					// 		"created_time",
					// 		"updated_time",
					// 		"latitude",
					// 		"longitude",
					// 		"altitude",
					// 	  ],
					// 	});
	
					//await joplin.commands.execute("openNote", newNote.id);
				});
	
			},
		});

		await joplin.views.menuItems.create(
		  "myMenuItemToolsReplaceResources",
		  "ReplaceResources",
		  MenuItemLocation.Tools
		);
	},
});
