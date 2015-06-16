"use strict";
var shelljs = require("shelljs"),
mochaPath, ret;

if (process.platform === "win32") {
  mochaPath = "node_modules/mocha/bin/_mocha";
} else {
  mochaPath = "_mocha";
}

if (process.argv[2]) {
  ret = shelljs.exec("jshint " + process.argv[2]);
  if (ret.code !== 0) {return ret.code;}
}

ret = shelljs.exec("istanbul cover -- " + mochaPath + " --colors -t 5000 test/*-test.js test/**/*-test.js");

return ret.code;
