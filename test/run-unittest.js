"use strict";
var mochaPath, ret;

if (process.platform === "win32") {
  mochaPath = "node_modules/mocha/bin/_mocha";
} else {
  mochaPath = "_mocha";
}

ret = require("child_process").spawnSync("istanbul", ["cover", "--", mochaPath, "--colors", "-t", "5000", "test/*-test.js", "test/**/*-test.js"]);

console.log(ret.stdout.toString());
