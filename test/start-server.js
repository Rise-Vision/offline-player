var spawn = require("child_process").spawn,
fs = require("fs"),
out = fs.openSync("test/mock-server-log.txt", "a");

console.log("Starting server");
serverProcess = spawn("node", ["test/mock-server.js"], {
  detached: true,
  stdio: ["ignore", out, out]
});

serverProcess.unref();
fs.writeFile("test/MOCK_SERVER_PID", serverProcess.pid);
