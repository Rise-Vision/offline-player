"use strict";
var path = require("path"),
itFiles = [],
serverProcess,
spawn = require("child_process").spawn,
childProcess;

function integrationTestCommand(itFile) {
  return ["../../mocha-chrome-app-test-runner/run-test.js", itFile];
}

itFiles = [
  path.join(process.cwd(), "test/platform/io-provider-it.js"),
  path.join(process.cwd(), "test/platform/ui-controller-it.js"),
  path.join(process.cwd(), "test/main/start-it.js")
];

if (process.argv[2]) {
  itFiles = [];
  itFiles[0] = process.argv[2];
}

runTest(itFiles.shift());

function runTest(testToRun) {
  if (testToRun === undefined || testToRun.indexOf("-it.js") === -1) {
    process.exit(0);
  }

  startServer();
  console.log("Running test " +testToRun);

  childProcess = spawn("node", integrationTestCommand(testToRun));

  childProcess.on("close", function(code) {
    console.log("Closed child process");
    stopServer();
    runTest(itFiles.shift());
  });

  childProcess.stderr.on("data", function(data) {
    var logOutput = data.toString();

    if (logOutput.indexOf("CONSOLE") > -1
    && logOutput.indexOf("CONSOLE(0)") === -1) {
      console.log("Chrome stderr: " + data);
    }

    if (logOutput.indexOf("All tests completed!0")) {
      //terminate child process automatically
    }
  });

  childProcess.stdout.on("data", function(data) {
    console.log("Chrome stdout: " + data);
  });
}

function startServer() {
  console.log("Starting server");
  serverProcess = spawn("node", ["test/mock-server.js"]);
  console.log("Server pid: " + serverProcess.pid);
  serverProcess.stdout.on("data", function(data) {
    console.log("Mock server: " + data);
  });
  serverProcess.stderr.on("data", function(data) {
    console.log("Mock server err: " + data);
  });
  serverProcess.on("close", function(code) {
    console.log("Server closed " + code);
  });
}

function stopServer() {
  console.log("Stopping server");
  serverProcess.kill();
}
