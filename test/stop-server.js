"use strict";
var shelljs = require("shelljs"),
fs = require("fs");

fs.readFile("test/MOCK_SERVER_PID", {encoding: "utf8"}, function(err, data) {
  if (err) throw err;

  console.log ("killing " + data);

  if (process.platform !== "win32") {
    shelljs.exec("kill " + data);
  } else {
    shelljs.exec("taskkill /P " + data);
  }

  shelljs.rm("test/MOCK_SERVER_PID");
});
