echo "running browserify"
browserify --detect-globals=false app/player/main/start.js -o app/player/main/start-browserify.js;

browserify --detect-globals=false app/player/options/options-page-init.js -o app/player/options/options-page-browserify.js 

echo "browserified!"
