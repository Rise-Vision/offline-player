"use strict";
var shelljs = require("shelljs"), execResult, fileToSyntaxCheck, itFiles = [];

fileToSyntaxCheck = process.argv[2] || "";

if (fileToSyntaxCheck) {
  execResult = shelljs.exec("jshint " + fileToSyntaxCheck);
  if (execResult.code !== 0) {return shelljs.exit(execResult.code);}
}

function integrationTestCommand(itFile) {
  return "node ../../mocha-chrome-app-test-runner/run-test.js " + process.cwd() + "/" + itFile;
}

itFiles = [
  "test/platform/io-provider-it.js",
  "test/platform/ui-controller-it.js",
  "test/main/start-it.js"
];

for (var i = 0; i < itFiles.length; i += 1) {
  console.log("Running test " + itFiles[i]);
  execResult = shelljs.exec(integrationTestCommand(itFiles[i]));
  if (execResult.code !== 0) {
    console.log("Test indicates unsuccessful result " + execResult.code);
    break;
  }
}

return shelljs.exit(execResult);
