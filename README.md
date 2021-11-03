# Joplin Plugin
This is a Joplin Plugin that replaces resources within Joplin from a local-to-machine location.

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


## Changelog

See [CHANGELOG.md](CHANGELOG.md)

## Links

- [Joplin - Getting started with plugin development](https://joplinapp.org/api/get_started/plugins/)
- [Joplin - Plugin API reference](https://joplinapp.org/api/references/plugin_api/classes/joplin.html)
- [Joplin - Data API reference](https://joplinapp.org/api/references/rest_api/)
- [Joplin - Plugin examples](https://github.com/laurent22/joplin/tree/dev/packages/app-cli/tests/support/plugins)
