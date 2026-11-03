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

### Integration Tests

To run the end-to-end integration tests using Playwright:

```bash
# Run headless (default, uses saved session in ~/.cache/playwright_ytmusic_profile)
python3 tests/test_integration.py

# Or run with browser UI visible
HEADLESS=false python3 tests/test_integration.py
```

### Releasing & Publishing

Publishing updates to the Chrome Web Store, Mozilla Add-ons (Firefox), and Microsoft Edge Add-ons is automated via the GitHub Actions [Publish Extension Updates](.github/workflows/publish.yml) workflow. For full setup instructions and where to acquire API credentials, see [CI.md](CI.md).

#### 1. Version Sync & Pre-flight Check
Before releasing:
1. Bump `"version"` simultaneously in:
   - `src/chromium/manifest.json`
   - `src/firefox/manifest.json`
2. Run the pre-flight check locally:
   ```bash
   ./bin/preflight_check.py
   ```
   The pre-flight check enforces that:
   - Both manifests have identical version numbers.
   - The version format conforms to browser extension standards.
   - The version is strictly higher than any previously tagged release.
   - All required assets exist and packages build successfully.

#### 2. Triggering a Release
* Create a git tag matching the version (e.g., `v1.2` or `1.2`) and publish a GitHub Release.
* The workflow will run the pre-flight check, build packages, attach the `.zip` and `.xpi` archives to the GitHub Release, and submit the updates to Chrome, Firefox, and Edge in parallel.
* You can also trigger the workflow manually under **Actions** > **Publish Extension Updates** with the option to publish to all or specific stores.

#### 3. Required Repository Secrets
Configure these under **Settings** > **Secrets and variables** > **Actions**:

* **Chrome Web Store:**
  * `CHROME_EXTENSION_ID`: `obkkkldnmaoahhpkhomdmdpjldcpihph`
  * `CHROME_PUBLISHER_ID`
  * `CHROME_CLIENT_ID`
  * `CHROME_CLIENT_SECRET`
  * `CHROME_REFRESH_TOKEN`
* **Mozilla Firefox Add-ons:**
  * `FIREFOX_JWT_ISSUER`
  * `FIREFOX_JWT_SECRET`
* **Microsoft Edge Add-ons:**
  * `EDGE_PRODUCT_ID`
  * `EDGE_CLIENT_ID`
  * `EDGE_API_KEY`

## Credits
Icon by [Icons8](https://icons8.com/)
