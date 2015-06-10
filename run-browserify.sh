#!/usr/bin/env bash
echo "running browserify"
browserify --detect-globals=false app/player/main/start.js -o app/player/main/start-browserify.js;

RETVAL=$?

browserify --detect-globals=false app/player/options/options-page-init.js -o app/player/options/options-page-browserify.js

if [[ $RETVAL -eq 0 ]]; then RETVAL=$?; fi

if [[ $RETVAL -eq 0 ]]; then
  echo "browserified!"
  exit 0
else
  exit 1
fi
