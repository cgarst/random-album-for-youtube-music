# Random Album for YouTube Music™ iOS Shortcut

Random Album is implemented for iOS through the Shortcuts app and [published through RoutineHub](https://routinehub.co/shortcut/18928/). This version is a two-part process. By first visiting YouTube Music in Safari and selecting Random Album in the share sheet, albums are pre-caching albums in a local file. Then, by tapping the shortcut in the home screen a random album is launched in the native YouTube Music app. The cache needs to be periodically re-generated from the share sheet to reflect albums later added or removed from your library.

## Development

Source for the shortcut is tracked here using [Shortcut Source Tool](https://routinehub.co/shortcut/5256/). This tool enables import/export of the shortcut as the `Random Album.json` file. The JavaScript portions are tracked as separate files to facilitate stand-alone testing.