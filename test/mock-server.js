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
    return res.end("<!doctype html><html><head></head><body>test remote page from mock server<img src='image-src' /></body></html>");
  }

  if (req.url.indexOf("folderContentsUrl") > -1) {
    res.writeHead(200, {"Content-Type": "application/json"});
    return res.end(JSON.stringify(
      { 
        result: true,
        code: 200,
        message: "success",
        items: [
          {
            objectId: "myPres/",
            folder: true,
            mediaLink: "https://www.googleapis.com/download/storage/v1/b/risemedialibrary-dd85fed1-6219-4660-b430-e135c1bf7100/o/myPres%2F?generation=1434566804654000&alt=media",
            etag: "CLCPseaxl8YCEAE=",
            kind: "storage#resourcesItem"
          },
          {
            objectId: "myPres/index.html",
            folder: false,
            mediaLink: "https://www.googleapis.com/download/storage/v1/b/risemedialibrary-dd85fed1-6219-4660-b430-e135c1bf7100/o/myPres%2Findex.html?generation=1434566804654000&alt=media",
            etag: "CLCPseaxl8YCEAE=",
            kind: "storage#resourcesItem"
          },
          {
            objectId: "myPres/test/",
            folder: true,
            mediaLink: "https://www.googleapis.com/download/storage/v1/b/risemedialibrary-dd85fed1-6219-4660-b430-e135c1bf7100/o/myPres%2Ftest%2F?generation=1434566804654000&alt=media",
            etag: "CLCPseaxl8YCEAE=",
            kind: "storage#resourcesItem"
          },
          {
            objectId: "myPres/test/image.jpg",
            folder: false,
            mediaLink: "https://www.googleapis.com/download/storage/v1/b/risemedialibrary-dd85fed1-6219-4660-b430-e135c1bf7100/o/myPres%2Ftest%2Fimage.jpg?generation=1434566804654000&alt=media",
            etag: "ALSPseaxl65GEAE=",
            kind: "storage#resourcesItem"
          }
        ]
      }
    ));
  }

  res.writeHead(200, {"Content-Type": "text/plain"});
  res.end('{"response": "local-http-ok"}');
}).listen(7654, "127.0.0.1", function() {console.log("listening on " + 7654);});
