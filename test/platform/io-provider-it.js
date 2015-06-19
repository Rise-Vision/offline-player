"use strict";
var assert = require("assert"),
serviceUrls = require("../main/mock-service-urls.js"),
platformIO = require("../../app/player/platform/io-provider.js")(serviceUrls);

describe("io provider", function() {
  it("exists", function() {
    assert.ok(platformIO, "existence");
  });

  it("fetches urls with a text promise return value", function() {
    return platformIO.httpFetcher("http://localhost:7654", {})
    .then(function(resp) {
      return resp.text();
    })
    .then(function(resp) {
        assert.ok(resp.indexOf("local-http-ok") > -1);
    });
  });

  it("fetches urls with a blob promise return value", function() {
    return platformIO.httpFetcher("http://localhost:7654", {})
    .then(function(resp) {
      return resp.blob();
    })
    .then(function(resp) {
        assert.ok(resp);
    });
  });

  it("fetches urls with a json promise return value", function() {
    return platformIO.httpFetcher("http://localhost:7654", {})
    .then(function(resp) {
      return resp.json();
    })
    .then(function(resp) {
        assert.equal(resp.response, "local-http-ok");
    });
  });

  it("fetches a list of files related to a Url", function() {
    var url = "https://www.googleapi.com/storage/v1/b/risemedialibrary-832989832323298329898323232983298983/myPres/index.html";

    return platformIO.getRemoteFolderItemsList(url)
    .then(function(resp) {
      assert.equal(resp.length, 3);
      assert.equal(resp[0].filePath, "index.html");
      assert.equal(resp[1].filePath, "test/");
      assert.equal(resp[2].filePath, "test/image.jpg");
    });
  });

  it("stores simple local objects", function() {
    return platformIO.localObjectStore.set({test1: "test1"})
    .then(function() {
      return new Promise(function(resolve, reject) {
        chrome.storage.local.get(["test1"], function(item) {
          resolve(item);
        });
      });
    })
    .then(function(val) {
      assert.deepEqual(val, {test1: "test1"});
    });
  });

  it("retrieves simple local objects", function() {
    return platformIO.localObjectStore.set({test2: "test2"})
    .then(function() {
      return platformIO.localObjectStore.get(["test2"]);
    })
    .then(function(val) {
      assert.deepEqual(val, {test2: "test2"});
    });
  });

  it("saves blobs to filesystem", function() {
    var blob = new Blob([1, 2, 3]);
    return platformIO.filesystemSave("test.html", blob)
    .then(function(resp) {
      return new Promise(function(resolve, reject) {
        webkitRequestFileSystem(PERSISTENT, 99000000000, function(fs) {
          fs.root.getFile("test.html", {}, function(entry) {
            entry.file(function(file) {
              resolve({fileThatWasSaved: file, urlThatWasReturned: resp});
            });
          }, function(err) {
            reject(err);
          });
        });
      });
    })
    .then(function(resp) {
      assert.ok(URL.createObjectURL(resp.fileThatWasSaved).indexOf("//") > -1);
      assert.ok(resp.urlThatWasReturned.indexOf("//") > -1);
    })
    .catch(function(err) {
      throw err;
    });
  });

  it("retrieves files and their objectURLs from filesystem", function() {
    var blob = new Blob([1, 2, 3]);
    var mimeTypeExtension = "html";
    return platformIO.filesystemSave("test", blob)
    .then(function() {
      return platformIO.filesystemRetrieve("test");
    })
    .then(function(resp) {
      assert.ok(resp.url.indexOf("blob:") > -1);
      assert.equal(resp.file.size, 3);
    });
  });

  it("knows when disconnected", function() {
    assert.equal(platformIO.isNetworkConnected(), navigator.onLine);
  });

  it("has a hashing method", function() {
    assert.ok(platformIO.hash);
  });
});
