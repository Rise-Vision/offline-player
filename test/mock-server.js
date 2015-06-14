"use strict";
var http = require("http");
http.createServer(function(req, res) {
  console.log("url requested: " + req.url);
  if (req.url.indexOf("scheduleFetchUrl") > -1) {
    res.writeHead(200, {"Content-Type": "application/json"});
    return res.end('{"content": {"schedule": {"name": "test schedule", "items": [{"type": "url", "objectReference": "http://localhost:7654/mock-remote-page.html", "timeDefined": "false", "name": "mock html"}]}}}');
  }

  if (req.url.indexOf("mock-remote-page") > -1) {
    res.writeHead(200, {"Content-Type": "text/html"});
    return res.end("<!doctype html><html><head></head><body>test</body></html>");
  }

  res.writeHead(200, {"Content-Type": "text/plain"});
  res.end('{"response": "local-http-ok"}');
}).listen(7654, "127.0.0.1");
