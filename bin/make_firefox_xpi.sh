# /bin/bash
zip -r -j -FS random-album-for-youtube-music.xpi ../src/firefox/manifest.json ../src/chromium/{background.js,content.js,icon16.png,icon48.png,icon128.png,options.html,options.js} --exclude '*.git*'
