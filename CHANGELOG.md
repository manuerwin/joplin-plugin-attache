# Changelog

## not released

chore: Bump dependencies (follow-redirects, node-fetch and @joplin/lib, plus npm update)
formatting: run prettier

## v1.3.1 (2024-01-12)

fix: show error message when path files setting is missing, plus clearer instructions around settings and the need to restart Joplin after settings changed.

## v1.3.0 (2023-12-26)

CHORE: updating Jopin framework. May also close out issue #19.
DOCS: minor updates to README - there is no UI.

## v1.2.0 (2023-07-18)

FIX: handle attachment resources that do not have title values (e.g. iPhone image upload).
IMPROVED: now able to browse for file location in settings.
IMPROVED: minor update to menu option name.
IMPROVED: better info logs in console.
DOCS: detail added to README re: importance of taking backups and original attachment resource name not being changed.

## v1.1.1 (2022-01-03)

IMPROVED: no need to remove files from step 2 directory for subsequent replacements.

## v1.1.0 (2022-01-03)

IMPROVED: original attachment created date preserved on replace from now on.

## v1.0.3 (2021-12-30)

IMPROVED: resource id as filename now uses original title for replace. Also increase app_min_version to 2.6.9.

## v1.0.2 (2021-12-16)

IMPROVED: Tools action now correctly named. Attachments folder only created/checked if setting has a value.

## v1.0.1 (2021-12-15)

DOCS: update package description

## v1.0.0 (2021-12-15)

Major version - name change from Replace Resources to Attaché

## v0.13.1 [beta] (2021-11-21)

Bumping the manifest file - no other changes

## v0.13.0 [beta] (2021-11-21)

NEW: resources can now also be replaced using filenames e.g. music.m3u

## v0.12.2 [beta] (2021-11-15)

IMPROVED: When no sync configured, Run on Start works.

## v0.12.1 [beta] (2021-11-14)

IMPROVED: When no sync implemented, resource creation occurs immediately, WITHOUT the sync setup popup.

## v0.12.0 [beta] (2021-11-14)

NEW: run replace resources after start and each synchronisation
Tests still not working.

## v0.11.0 [pre-release] (2021-11-13)

Pre-release, no tests working yet.