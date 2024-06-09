# /bin/bash
zip -r -j -FS ytmusic-random-album.xpi ../src/firefox/manifest.json ../src/chromium/{background.js,content.js,icon16.png,icon48.png,icon128.png} --exclude '*.git*'
