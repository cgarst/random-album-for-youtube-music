# Random Album for YouTube Music™ iOS Shortcut

This shortcut opens a random album from your YouTube Music™ library on iOS and iPadOS with a two-part process:

1. Visit YouTube Music in Safari and select Random Album in the share sheet. Albums are pre-cached in a local file. 
2. Tap the shortcut in the home screen and a random album is launched in the native YouTube Music app.

The cache needs to be periodically re-generated from the share sheet to reflect albums later added or removed from your library.

## Development

Source for the shortcut is tracked using the [Shortcut Source Tool](https://routinehub.co/shortcut/5256/). This tool enables import/export of the shortcut as the `Random Album.json` file. 

The JavaScript portions are tracked as separate files to facilitate stand-alone testing.