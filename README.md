# Joplin Plugin
A Joplin Plugin that mass replaces Resources and resource references within Notes.

## Installation

### Automatic

- Go to `Tools > Options > Plugins`
- Search for `Replace Resources`
- Click Install plugin
- Restart Joplin to enable the plugin

### Manual

- Download the latest released JPL package (`io.github.manuerwin.replaceresources.jpl`) from [here](https://github.com/manuerwin/joplin-plugin-replace-resources/releases/latest)
- Close Joplin
- Copy the downloaded JPL package in your profile `plugins` folder
- Start Joplin

## Usage

First configure the Plugin under `Tools > Options > Replace Resources`!

Resources are replaced via the command `Tools > Replace Resources`

## Options

Go to `Tools > Options > Replace Resources`

| Option                       | Description                                                                                                                                                              | Default                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| `Files path`                | Where to obtain the files that will replace resources. <br>Filenames MUST be only the target resource id in the format of <resource_id>.<file_extension>, for example b1a7160da73b45ba80b9aeb0bc9d574c.png                                                    |                         |

## Building the plugin

The plugin is built using Webpack, which creates the compiled code in `/dist`.
A JPL archive will also be created in `/publish`, which can be used to distribute the plugin.

To build the plugin, simply run `npm run dist`.

The project is setup to use TypeScript, although you can change the configuration to use plain JavaScript.

## Testing the plugin

To test the plugin, simply run `npm test`.

This project is setup to use Jest, for testing purposes.

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
