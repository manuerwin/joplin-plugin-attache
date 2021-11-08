# Joplin Plugin
A Joplin Plugin that mass replaces Resources.

## Installation

### Automatic

- Go to `Preferences > Plugins` (Mac) OR `Tools > Options > Plugins`
- Search for `Replace Resources`
- Click Install plugin
- Restart Joplin to enable the plugin

### Manual

- Download the latest released JPL package (`io.github.manuerwin.replaceresources.jpl`) from [here](https://github.com/manuerwin/joplin-plugin-replace-resources/releases/latest)
- Close Joplin
- Copy the downloaded JPL package into your profile `plugins` folder
- Start Joplin

## Usage

First configure the Plugin under `Preferences > Plugins > Replace Resources` (Mac) OR `Tools > Options > Replace Resources` (PC?)

Due to Joplin's synchronisation conflict safeguards, this is a two step process at present.

## Configuration Options

| Option                       | Description                                                                                                                                                              | Default                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| `Files Path`                | Where to obtain the files that will replace resources. <br>Filenames MUST be only the target resource id in the format of <resource_id>.<file_extension>, for example b1a7160da73b45ba80b9aeb0bc9d574c.png, others will be ignored.                 |                         |

### Step One - deleting resources followed by synchronisation
After setting the configuration settings and restarting, the file and processing sub-directories are automatically created for you.
Move (or copy if you're nervous :) ) the resource files you wish to replace into your defined files path.
Then choose the `Tools > Replace Resources: Step 1 Delete + Step 2 Sync` command.
This will delete each matching resource within Joplin, and move your file to the `1-resourceIsDeletedSyncNeeded` directory.

Important: this step has NOT updated your Notes, you will see the resource reference within any note still exists, however the preview of the note will only show the placeholder icon.

Synchronisation is started for you, you'll see remote resources being deleted.

### Step Two - creating resources
After the above synchronisation has finished, choose the `Tools > Replace Resources: Step 2 Create` command.
This will create each resource within Joplin, and move your file to the `2-resourceIsReplaced` directory.

Again, your Notes have NOT been updated in any way, the placeholder icon in preview will now show your replacement resource :)

## Building the plugin

The plugin is built using Webpack, which creates the compiled code in `/dist`.
A JPL archive will also be created in `/publish`, which can be used to distribute the plugin.

To build the plugin, simply run `npm run dist`.

The project is setup to use TypeScript, although you can change the configuration to use plain JavaScript.

## Testing the plugin

To test the plugin, simply run `npm test`.

This project is setup to use Jest for testing purposes.

## Updating the plugin framework

To update the plugin framework, run `npm run update`.

In general this command tries to do the right thing - in particular it's going to merge the changes in package.json and .gitignore instead of overwriting. It will also leave "/src" as well as README.md untouched.

The file that may cause problem is "webpack.config.js" because it's going to be overwritten. For that reason, if you want to change it, consider creating a separate JavaScript file and include it in webpack.config.js. That way, when you update, you only have to restore the line that include your file.

## Changelog

See [CHANGELOG.md](CHANGELOG.md)

## Links

- [Joplin - Getting started with plugin development](https://joplinapp.org/api/get_started/plugins/)
- [Joplin - Plugin API reference](https://joplinapp.org/api/references/plugin_api/classes/joplin.html)
- [Joplin - Data API reference](https://joplinapp.org/api/references/rest_api/)
- [Joplin - Plugin examples](https://github.com/laurent22/joplin/tree/dev/packages/app-cli/tests/support/plugins)
