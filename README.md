# 🎲 Random Album for YouTube Music™
Can't decide which record to spin? This browser extension plays a random album from your YouTube Music™ library.

## Usage
While in YouTube Music, click the extension icon. This will navigate to your album library, open a random album, and play it.

## Chromium-based Browser Installation
[Install from Chrome Web Store](https://chromewebstore.google.com/detail/random-album-for-youtube/obkkkldnmaoahhpkhomdmdpjldcpihph).
[Install from Microsoft Edge Addons](https://microsoftedge.microsoft.com/addons/detail/afmlimmhgjaemnkjjaomlogigfiodncd)

## Firefox-based Browser Installation
[Install from Add-ons for Firefox](https://addons.mozilla.org/en-US/firefox/addon/random-album-for-youtube-music/).

In addition to Firefox desktop, Android devices can install the same [add-on](https://addons.mozilla.org/en-US/firefox/addon/random-album-for-youtube-music/) within Firefox for Android. Selecting the extension from the Firefox menu. Optionally select "Open in app" from the Firefox menu to open the album in the native YouTube Music app.

## iOS
Random Album is implemented on [iOS](https://www.icloud.com/shortcuts/b69cc0ce28a846ca8e2845c775df3166) through the Shortcuts app. This version is a two-part process. By first visiting YouTube Music in Safari and selecting Random Album in the share sheet, albums are pre-caching albums in a local file. Then, by tapping the shortcut in the home screen a random album is launched in the native YouTube Music app. The cache needs to be periodically re-generated from the share sheet to reflect albums later added or removed from your library.

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
