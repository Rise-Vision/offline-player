browserify --detect-globals=false --no-builtins --no-bundle-external app/player/schedule/start.js -o app/player/main/main-window-browserify.js;

browserify --detect-globals=false --no-builtins --no-bundle-external app/player/options/options-page-init.js -o app/player/options/options-page-browserify.js 

echo "browserified!"
