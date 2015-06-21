"use strict";
var path = require("path"),
itFiles = [],
serverProcess,
spawn = require("child_process").spawn,
childProcess;

itFiles = [
  path.join(process.cwd(), "test/platform/io-provider-it.js"),
  path.join(process.cwd(), "test/platform/ui-controller-it.js"),
  path.join(process.cwd(), "test/main/start-it.js")
];

if (process.argv[2]) {
  itFiles = [process.argv[2]];
}

function integrationTestCommandOptions() {
  return ["node_modules/chrome-app-test-runner/run-test.js"]
  .concat(itFiles)
  .concat("--mock-server=" + path.join(process.cwd(), "test/mock-server.js"));
}

console.log("Running test runner against " + itFiles.length + " files");
childProcess = spawn("node", integrationTestCommandOptions());

childProcess.stderr.on("data", function(data) {
  console.log(data.toString());
});

childProcess.stdout.on("data", function(data) {
  console.log(data.toString());
});
