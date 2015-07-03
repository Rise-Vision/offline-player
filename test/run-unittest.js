"use strict";
var istanbul, mochaPath, ret;

if (process.platform === "win32") {
  istanbul = "istanbul.cmd";
  mochaPath = "node_modules/mocha/bin/_mocha";
} else {
  istanbul = "istanbul";
  mochaPath = "_mocha";
}

ret = require("child_process").spawnSync(istanbul, ["cover", "--", mochaPath, "--colors", "-t", "5000", "test/*-test.js", "test/**/*-test.js"]);

console.log(ret.stdout.toString());
console.log(ret.stderr.toString());
