# 🎲 Random Album for YouTube Music™
Introducing Random Album for YouTube Music™, the extension that brings back the joy of experiencing music as it was meant to be heard – in its entirety. Just like dropping the needle on a vinyl record or popping a CD into your player, Random Album for YouTube Music™ scans your library to select and stream a random album from start to finish.

[![name](res/Chrome.png)](https://chromewebstore.google.com/detail/random-album-for-youtube/obkkkldnmaoahhpkhomdmdpjldcpihph)
[![name](res/Edge.png)](https://microsoftedge.microsoft.com/addons/detail/afmlimmhgjaemnkjjaomlogigfiodncd)
[![name](res/Firefox.png)](https://addons.mozilla.org/en-US/firefox/addon/random-album-for-youtube-music/)
[![name](res/RoutineHub.png)](https://routinehub.co/shortcut/18928/)

## Desktop Usage

While in YouTube Music, click the extension icon. This will navigate to your album library, open a random album, and play it. For long listens, head to the extension options to enable album shuffle and queue up multiple albums!

## Mobile Usage
Random Album is implemented for iOS through the Shortcuts app and [published through RoutineHub](https://routinehub.co/shortcut/18928/).

Android devices can install the [add-on](https://addons.mozilla.org/en-US/firefox/addon/random-album-for-youtube-music/) within Firefox for Android. Selecting the extension from the Firefox menu. Optionally select "Open in app" from the Firefox menu to open the album in the native YouTube Music app.

## Troubleshooting
The album will not automatically play if the site is denied autoplay by the browser. A message may be logged to console like "Autoplay is only allowed when approved by the user, the site is activated by the user, or media is muted." This can be resolved by giving the site autoplay permission in the permissions icon near the address bar.

## Development

Sideloading on Chromium browsers:

 1. Browse to `chrome://extensions`
 2. Enable extension developer mode in the browser, if necessary, to allow loading unpacked extensions
 3. Select the "Load unpacked" extension option and navigate to the `src/chromium/` directory

Sideloading on Firefox browsers:

1. Temporary installation in the Firefox release version:
   * Run `cd bin/ && ./make_firefox_xpi.sh` to build the XPI extension file
   * Browse to `about:debugging` and "This Firefox"
   * Select "Load Temporary Add-On", "Install Add-on From File", and select `bin/random-album-for-youtube-music.xpi`
2. Permanent installation in Firefox Developer Edition or Floorp:
   * Browse to `about:config` and set `xpinstall.signatures.required` to "false"
   * Browse to `about:addons`, click the gear icon, and select "Install Add-on from File"
   * Select `bin/random-album-for-youtube-music.xpi`

## Credits
Icon by [Icons8](https://icons8.com/)
