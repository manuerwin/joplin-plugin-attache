<!-- vscode-markdown-toc -->
* [Attaché Overview](#Attachéoverview)
* [Installation](#Installation)
	* [Automatic](#Automatic)
	* [Manual](#Manual)
* [Usage](#Usage)
	* [Manual use](#Manualuse)
		* [Step One - deleting resources and sync'ing](#StepOne-deletingresourcesandsyncing)
		* [Step Two - creating resources](#StepTwo-creatingresources)
	* [Automated use](#Automateduse)

<!-- vscode-markdown-toc-config
	numbering=false
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->
# <a name='Attachéoverview'></a>Attaché Overview
A Joplin plugin. Your attachment updater. Mass replacement of Joplin attachments (resources) such as resized image files, current music playlists, and any other attachments you need to one-off or regularly update within Joplin.

# <a name='Installation'></a>Installation
## <a name='Automatic'></a>Automatic
- Go to `Preferences > Plugins` (Mac) OR `Tools > Options > Plugins`
- Search for `Attaché`
- Click Install plugin
- Restart Joplin to enable the plugin

## <a name='Manual'></a>Manual
- Download the latest released JPL package (`io.github.manuerwin.attache.jpl`) from [here](https://github.com/manuerwin/joplin-plugin-attache/releases/latest)
- Go to `Preferences > Plugins` (Mac) OR `Tools > Options > Plugins`
- Click cog icon next to "Manage your plugins" > Install from file > choose the recently downloaded file
- Restart Joplin to enable the plugin

# <a name='Usage'></a>Usage
___Backup your data!___

Then configure the Plugin via `Preferences > Plugins > Attaché` (Mac) OR `Tools > Options > Attaché` (PC?).

___NOTE___ Make sure a value is set for the Path configuration value that defines the location of the files that will replace your existing resources.
![Attaché_plugin_config_options](/img/Attaché_plugin_config_options.png)

Please be aware there is no UI as Attaché runs in the background.

___NOTE___ due to Joplin's synchronisation conflict safeguards, file/resource replace is a two-step process that is automated for you by the plugin.

## <a name='Manualuse'></a>Manual use
After backing up your data, defining the configuration settings and restarting Joplin, the file and processing sub-directories are automatically created for you.

___CAUTION___ There has been a report of problems processing a very large number of replacement files (8000+), please backup your Joplin data (for example; by using the easy export option), then perform a small test to make sure all works ok for you. Suggest not touching Joplin notes/resources while the replacement is happening. Also take note of how source files can be named below.

### <a name='StepOne-deletingresourcesandsyncing'></a>Step One - deleting resources and sync'ing
Move your source files into the files path that you entered/choose in settings. Your source files can be named in two ways:
1) the same filename as shown in your notes (for example, music.m3u)
2) the id of the resource (for example, b8bf831c8d804f6d8e5ab13ae12de595.jpg)

___IMPORTANT___ If you are choosing to replace resources via filename (for example, music.m3u), you must be ___CERTAIN___:
1. there is **only one resource with that filename across all your notes**. If there are more, none will be replaced. AND
2. The **filename in your note must be unchanged** from when you originally attached it. This is because of the way Joplin stores references to resources(attachments) under the covers.

Choose the `Tools > Attaché - Replace/update attachments` command (Mac) OR the equivalent navigation command (PC).

The plugin takes over from now on, it will delete each matching resource within Joplin, and move each source file to the `Step 1 - Resource Deleted Sync Needed` sub-directory.

___IMPORTANT___ this step has **NOT** updated your Notes, you will see the resource reference within any note still exists, however the preview of the note/resource will show a placeholder icon because the underlying resource (aka attachment) no longer exists.

Synchronisation is automatically started for you (if you have it configured), you'll see remote resources being deleted.
___IMPORTANT___ let synchronisation complete, else you risk conflicts.

___IMPORTANT___ a .REPLACE file is created in the `Step 1 - Resource Deleted Sync Needed` sub-directory for each of the resources you are replacing, please don't touch these as Attaché uses them for step two.

### <a name='StepTwo-creatingresources'></a>Step Two - creating resources
After the above synchronisation has finished, the plugin will create each resource within Joplin, and move your source file to the `Step 2 - Resource Replaced` sub-directory.

Again, your Notes have **NOT** been updated in any way. The placeholder icon in preview will now show your replacement resource (once you navigate and then back to a note), as your replacement file has just been created with the same reference id that is in your note.

Also note: your source replacement files are **NEVER** deleted, they are simply moved to different locations so you know the status of each file/resource.

## <a name='Automateduse'></a>Automated use
By enabling the `Run on start and after sync` option, Attaché will be run on Joplin start and following synchronisation for you.

At any time, move your source files into the Path file location, and either restart Joplin or force synchronisation and the plugin will perform the same steps detailed above.

# Configuration Options
| Option          | Description | Default  | Required |
| --------------- | ----------- | -------  | -------- |
| `Files Path`    | Where to obtain the replacement files that will replace existing resources. See Step One above for the two formats that replacement filenames can have. All others will be ignored. |  | YES |
| `Run on start and after sync`  | If checked (i.e. true), Attaché will run immediately after Joplin starts and after each synchronisation.    | unchecked (i.e. will NOT run on start or after sync by default) | Optional |

![Attaché_plugin_config_options](/img/Attaché_plugin_config_options.png)

# Changelog

See [CHANGELOG.md](CHANGELOG.md)

# Developers: Links
Would you like to contribute to this or build your own plugin?

- [Joplin - Getting started with plugin development](https://joplinapp.org/api/get_started/plugins/)
- [Joplin - Plugin API reference](https://joplinapp.org/api/references/plugin_api/classes/joplin.html)
- [Joplin - Data API reference](https://joplinapp.org/api/references/rest_api/)
- [Joplin - Plugin examples](https://github.com/laurent22/joplin/tree/dev/packages/app-cli/tests/support/plugins)
