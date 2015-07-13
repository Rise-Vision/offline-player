"use strict";
var http = require("http");

http.createServer(function(req, res) {
  console.log("url requested: " + req.url);
  if (req.url.indexOf("scheduleFetchUrl") > -1) {
    res.writeHead(200, {"Content-Type": "application/json"});
    console.log("returning content");
    return res.end('{"content": {"schedule": {"name": "test schedule", "items": [{"type": "url", "objectReference": "http://localhost:7654/mock-remote-page.html", "timeDefined": "false", "name": "mock html"}]}}}');
  }

  if (req.url.indexOf("segmentEvent") > -1) {
    res.writeHead(200, {"Content-Type": "application/json"});
    req.on("data", function(data) {
      console.log("returning " + data.toString());
      res.end(data.toString());
    });
    return;
  }

  if (req.url.indexOf("mock-remote-page") > -1) {
    res.writeHead(200, {"Content-Type": "text/html"});
    console.log("returning mock html page");
    return res.end("<!doctype html><html><head></head><body>test remote page from mock server<img src='image-src' /></body></html>");
  }

  if (req.url.indexOf("folderContentsUrl") > -1) {
    res.writeHead(200, {"Content-Type": "application/json"});
    console.log("returning mock folder contents json");
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

  if (req.url.indexOf("registerTargetUrl") > -1) {
    res.writeHead(200, {"Content-Type": "application/json"});
    console.log("returning positive json response");
    return res.end(JSON.stringify({ result:true }));
  }

  res.writeHead(200, {"Content-Type": "text/plain"});
  console.log("returning plain text ok response");
  res.end('{"response": "local-http-ok"}');
}).listen(7654, "127.0.0.1", function() {console.log("listening on " + 7654);});
