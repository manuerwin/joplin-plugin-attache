# Attaché
A Joplin Plugin that mass replaces Resources.

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

First configure the Plugin under `Preferences > Plugins > Attaché` (Mac) OR `Tools > Options > Attaché` (PC?)

Note: due to Joplin's synchronisation conflict safeguards, this is a two-step automated process.

## Manual use
After setting the configuration settings and restarting, the file and processing sub-directories are automatically created for you.

### Step One - deleting resources and sync'ing
Move your source files into the files path that you entered into settings. Your source files can be named in two ways:
1) the same filename as shown in your notes (for example, music.m3u)
2) the id of the resource (for example, b8bf831c8d804f6d8e5ab13ae12de595.jpg)

IMPORTANT: If you are choosing to replace resources via filename (for example, music.m3u), you must be certain there is only one resource with that filename across all your notes. If there are more, none will be replaced.
AND: The filename in your note must be unchanged from when you originally attached it.

Choose the `Tools > Attaché` command.
This will delete each matching resource within Joplin, and move each source file to the `Step 1 - Resource Deleted Sync Needed` sub-directory.

Important: this step has NOT updated your Notes, you will see the resource reference within any note still exists, however the preview of the note/resource will show a placeholder icon.

Synchronisation is automatically started for you, you'll see remote resources being deleted.

Note: a .REPLACE file is created in this sub-directory for each of the resources you are replacing, you can ignore these.

### Step Two - creating resources
After the above synchronisation has finished, the plugin will create each resource within Joplin, and move your source file to the `Step 2 - Resource Replaced` sub-directory.

Again, your Notes have NOT been updated in any way, the placeholder icon in preview will now show your replacement resource :)

Also note: your source files are NEVER deleted, they are simply moved to different locations so you know the status of each file/resource.

## Automated use

By enabling the `Run on start and after sync` option, Attaché will be run on Joplin start and following synchronisation for you.

Move your source files into the files path, matching the settings entry.

Either restart Joplin or force synchronisation.

# Configuration Options

| Option          | Description | Default  |
| --------------- | ----------- | -------  |
| `Files Path`    | Where to obtain the files that will replace resources. <br>Filenames MUST be only the target resource id in the format of <resource_id>.<file_extension>, for example b1a7160da73b45ba80b9aeb0bc9d574c.png, others will be ignored. |       |
| `Run on start and after sync`  | If checked (i.e. true), Attaché will run immediately after Joplin starts and after each synchronisation.    | unchecked (i.e. will NOT run on start or after sync by default) |

# Building the plugin

The plugin is built using Webpack, which creates the compiled code in `/dist`.
A JPL archive will also be created in `/publish`, which can be used to distribute the plugin.

To build the plugin, simply run `npm run dist`.

The project is setup to use TypeScript, although you can change the configuration to use plain JavaScript.

# Testing the plugin

To test the plugin, simply run `npm test`.

This project is setup to use Jest for testing purposes.

# Updating the plugin framework

To update the plugin framework, run `npm run update`.

In general this command tries to do the right thing - in particular it's going to merge the changes in package.json and .gitignore instead of overwriting. It will also leave "/src" as well as README.md untouched.

The file that may cause problem is "webpack.config.js" because it's going to be overwritten. For that reason, if you want to change it, consider creating a separate JavaScript file and include it in webpack.config.js. That way, when you update, you only have to restore the line that include your file.

# Changelog

See [CHANGELOG.md](CHANGELOG.md)

# Links

- [Joplin - Getting started with plugin development](https://joplinapp.org/api/get_started/plugins/)
- [Joplin - Plugin API reference](https://joplinapp.org/api/references/plugin_api/classes/joplin.html)
- [Joplin - Data API reference](https://joplinapp.org/api/references/rest_api/)
- [Joplin - Plugin examples](https://github.com/laurent22/joplin/tree/dev/packages/app-cli/tests/support/plugins)
