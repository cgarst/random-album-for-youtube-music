# /bin/bash
zip -r -j -FS random-album-for-youtube-music.zip ../src/chromium/{manifest.json,background.js,content.js,icon16.png,icon48.png,icon128.png} --exclude '*.git*'
