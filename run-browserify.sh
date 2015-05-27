echo "running browserify"
browserify --detect-globals=false app/player/schedule/start.js -o app/player/main/main-window-browserify.js;

browserify --detect-globals=false app/player/options/options-page-init.js -o app/player/options/options-page-browserify.js 

echo "browserified!"
