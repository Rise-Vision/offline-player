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

  it("fetches a rejects a non valid url", function() {
    var url = "https://www.google.com";

    return platformIO.getRemoteFolderItemsList(url)
    .then(function() {
    }, function(err) {
      assert(err !== null);
    });
  });

  it("fetches a list of files related to a Url", function() {
    var url = "https://www.googleapi.com/storage/v1/b/risemedialibrary-dd85fed1-6219-4660-b430-e135c1bf7100/myPres/index.html";

    return platformIO.getRemoteFolderItemsList(url)
    .then(function(resp) {
      assert.equal(resp.length, 2);
      assert.equal(resp[0].filePath, "index.html");
      assert.equal(resp[1].filePath, "test/image.jpg");
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
    var blob = new Blob([1, 2, 3]),
    url = "http://www.site.com/test/file1.txt",
    sha1sum = "e758ec0ffda0dda283f33076ad976e86f181ef7c"; //sha1sum of url

    return platformIO.filesystemSave(url, blob)
    .then(function(resp) {
      return new Promise(function(resolve, reject) {
        webkitRequestFileSystem(PERSISTENT, 99000000000, function(fs) {
          fs.root.getFile(sha1sum + ".txt", {}, function(entry) {
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

  it("retrieves files contents and their objectURLs from filesystem", function() {
    var blob = new Blob([1, 2, 3]);
    var mimeTypeExtension = "html";
    return platformIO.filesystemSave("test", blob)
    .then(function() {
      return platformIO.filesystemRetrieve("test");
    })
    .then(function(resp) {
      assert.ok(resp.url.indexOf("blob:") > -1);
      assert.equal(resp.file, "123");
    });
  });
  
  it("knows when disconnected", function() {
    assert.equal(platformIO.isNetworkConnected(), navigator.onLine);
  });
});
