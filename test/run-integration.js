"use strict";
var shelljs = require("shelljs"),
execResult,
fileToSyntaxCheck,
itFiles = [],
serverProcess,
spawn = require("child_process").spawn,
childProcess;

fileToSyntaxCheck = process.argv[2] || "";

if (fileToSyntaxCheck) {
  execResult = shelljs.exec("jshint " + fileToSyntaxCheck);
  if (execResult.code !== 0) {return shelljs.exit(execResult.code);}
}

function integrationTestCommand(itFile) {
  return ["../../mocha-chrome-app-test-runner/run-test.js", process.cwd() + "/" + itFile];
}

itFiles = [
  "test/platform/io-provider-it.js",
  "test/platform/ui-controller-it.js",
  "test/main/start-it.js"
];

runTest(itFiles.shift());

function runTest(testToRun) {
  if (testToRun === undefined) {
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
