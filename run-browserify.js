"use strict";
var shelljs = require("shelljs"), execResult;

console.log("running browserify");
execResult = shelljs.exec("browserify --detect-globals=false app/player/main/call-start.js -o app/player/main/start-browserified.js");

if (execResult.code !== 0) {return shelljs.exit(execResult.code);}

execResult = shelljs.exec("browserify --detect-globals=false app/player/options/options-page-init.js -o app/player/options/options-page-browserified.js");

return shelljs.exit(execResult.code);
