var http = require("http");
http.createServer(function(req, res) {
  res.writeHead(200, {"Content-Type": "text/plain"});
  res.end("local-http-ok");
}).listen(7654, "127.0.0.1");
