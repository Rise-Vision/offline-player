var http = require("http");
http.createServer(function(req, res) {
  res.writeHead(200, {"Content-Type": "text/plain"});
  res.end('{"response": "local-http-ok"}');
}).listen(7654, "127.0.0.1");
