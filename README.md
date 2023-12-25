# Attaché
A Joplin plugin. Your attachment updater. Mass replacement of Joplin attachments (resources) such as resized image files, current music playlists, and any other attachments you need to one-off or regularly update within Joplin.

# Installation
## Automatic
- Go to `Preferences > Plugins` (Mac) OR `Tools > Options > Plugins`
- Search for `Attaché`
- Click Install plugin
- Restart Joplin to enable the plugin

## Manual
- Download the latest released JPL package (`io.github.manuerwin.attache.jpl`) from [here](https://github.com/manuerwin/joplin-plugin-attache/releases/latest)
- Close Joplin
- Copy the downloaded JPL package into your profile `plugins` folder
- Start Joplin

# Usage
First backup your data!

Then configure the Plugin under `Preferences > Plugins > Attaché` (Mac) OR `Tools > Options > Attaché` (PC?)

Please be aware there is no UI (other than the dev console) as Attaché runs in the background.

Note: due to Joplin's synchronisation conflict safeguards, this is a two-step automated process.

## Manual use
After setting the configuration settings and restarting, the file and processing sub-directories are automatically created for you.

There has been a report of problems processing a very large number of replacement files (8000+), please backup your Joplin data by using the easy export option, perform a small test to make sure all works ok for you.
Also suggest not touching Joplin notes/resources while the replacement is happening.

### Step One - deleting resources and sync'ing
Move your source files into the files path that you entered/choose in settings. Your source files can be named in two ways:
1) the same filename as shown in your notes (for example, music.m3u)
2) the id of the resource (for example, b8bf831c8d804f6d8e5ab13ae12de595.jpg)

**IMPORTANT**: If you are choosing to replace resources via filename (for example, music.m3u), you must be certain:
1. there is **only one resource with that filename across all your notes**. If there are more, none will be replaced. AND
2. The **filename in your note must be unchanged** from when you originally attached it. This is because of the way Joplin stores references to resources(attachments) under the covers.

Choose the `Tools > Attaché - Replace/update attachments` command (Mac) OR '???' command (PC).
This will delete each matching resource within Joplin, and move each source file to the `Step 1 - Resource Deleted Sync Needed` sub-directory.

Important: this step has NOT updated your Notes, you will see the resource reference within any note still exists, however the preview of the note/resource will show a placeholder icon because the underlying resource (aka attachment) no longer exists.

Synchronisation is automatically started for you, you'll see remote resources being deleted.

Note: a .REPLACE file is created in this sub-directory for each of the resources you are replacing, please don't touch these as Attaché uses them for step two.

### Step Two - creating resources
After the above synchronisation has finished, the plugin will create each resource within Joplin, and move your source file to the `Step 2 - Resource Replaced` sub-directory.

Again, your Notes have NOT been updated in any way. The placeholder icon in preview will now show your replacement resource, as your replacement file has just been created with the same reference id that's in your note.

Also note: your source replacement files are NEVER deleted, they are simply moved to different locations so you know the status of each file/resource.

## Automated use
By enabling the `Run on start and after sync` option, Attaché will be run on Joplin start and following synchronisation for you.

Move your source files into the files path, matching the settings entry.

Either restart Joplin or force synchronisation.

# Configuration Options
| Option          | Description | Default  |
| --------------- | ----------- | -------  |
| `Files Path`    | Where to obtain the replacement files that will replace existing resources. See Step One above for the two formats replacement filenames can have. All others will be ignored. |       |
| `Run on start and after sync`  | If checked (i.e. true), Attaché will run immediately after Joplin starts and after each synchronisation.    | unchecked (i.e. will NOT run on start or after sync by default) |

# Changelog

See [CHANGELOG.md](CHANGELOG.md)

# Developers: Links
Would you like to contribute to this or build your own plugin?

- [Joplin - Getting started with plugin development](https://joplinapp.org/api/get_started/plugins/)
- [Joplin - Plugin API reference](https://joplinapp.org/api/references/plugin_api/classes/joplin.html)
- [Joplin - Data API reference](https://joplinapp.org/api/references/rest_api/)
- [Joplin - Plugin examples](https://github.com/laurent22/joplin/tree/dev/packages/app-cli/tests/support/plugins)
