#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

zip -r -j -FS random-album-for-youtube-music.xpi \
  ../src/firefox/manifest.json \
  ../src/chromium/background.js \
  ../src/chromium/content.js \
  ../src/chromium/icon16.png \
  ../src/chromium/icon48.png \
  ../src/chromium/icon128.png \
  ../src/chromium/options.html \
  ../src/chromium/options.js \
  --exclude '*.git*'
