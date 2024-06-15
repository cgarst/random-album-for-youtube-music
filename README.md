# 🎲 Random Album for YouTube Music™
Can't decide which record to spin? This browser extension plays a random album from your YouTube Music™ library.

## Chromium-based Browser Installation
[Install from Chrome Web Store](https://chromewebstore.google.com/detail/random-album-for-youtube/obkkkldnmaoahhpkhomdmdpjldcpihph).
[Install from Microsoft Edge Addons](https://microsoftedge.microsoft.com/addons/detail/afmlimmhgjaemnkjjaomlogigfiodncd)

Development:

 1. Browse to `chrome://extensions`
 2. Enable extension developer mode in the browser, if necessary, to allow loading unpacked extensions
 3. Select the "Load unpacked" extension option and navigate to the `src/chromium/` directory

## Firefox-based Browser Installation
[Install from Add-ons for Firefox](https://addons.mozilla.org/en-US/firefox/addon/random-album-for-youtube-music/).

Development:

 1. Temporary installation in the Firefox release version:
   1. Run `cd bin/ && ./make_firefox_xpi.sh` to build the XPI extension file
   2. Browse to `about:debugging` and "This Firefox"
   3. Select "Load Temporary Add-On", "Install Add-on From File", and select `bin/random-album-for-youtube-music.xpi`


 2. Permanent installation in Firefox Developer Edition:
   1. Browse to `about:config` and set `xpinstall.signatures.required` to "false"
   2. Browse to `about:addons`, click the gear icon, and select "Install Add-on from File"
   3. Select `bin/random-album-for-youtube-music.xpi`

## Mobile Devices
Random Album is be implemently  on [iOS](https://www.icloud.com/shortcuts/92a8c0e01abd40a4bc50593dc854fba0) through the Shortcuts app. This version is a two-part process. By first visiting YouTube Music in Safari and selecting Random Album in the share sheet, albums are pre-caching albums in a local file. Then, by tapping the shortcut in the home screen a random album is launched in the native YouTube Music app. The cache needs to be periodically re-generated from the share sheet to reflect albums later added or removed from your library.

Android devices can install the [add-on](https://addons.mozilla.org/en-US/firefox/addon/random-album-for-youtube-music/) within Firefox for Android. Selecting the extension from the Firefox menu. Optionally select "Open in app" from the Firefox menu to open the album in the native YouTube Music app.

## Usage
While in YouTube Music, click the extension icon. This will navigate to your album library, open a random album, and play it.

## Troubleshooting
The album will not automatically play if the site is denied autoplay by the browser. A message may be logged to console like "Autoplay is only allowed when approved by the user, the site is activated by the user, or media is muted." This can be resolved by giving the site autoplay permission in the permissions icon near the address bar.

## Credits
Icon by [Icons8](https://icons8.com/)
