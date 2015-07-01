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

  it("rejects a non valid remote folder url", function() {
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
    url = "http://www.site.com/test/1/file1.txt",
    mainUrlPath = "http://www.site.com/test/",
    sha1sum = "be3da096623146256303ffb7cf49748b553ac61d"; //sha1sum of main url path

    return platformIO.filesystemSave(mainUrlPath, "1/file1.txt", blob)
    .then(function(resp) {
      return new Promise(function(resolve, reject) {
        webkitRequestFileSystem(PERSISTENT, 99000000000, function(fs) {
          fs.root.getDirectory(sha1sum, {create: false}, function(dir) {
            dir.getDirectory("1", {create: false}, function(dir) {
              dir.getFile("file1.txt", {create: false}, function(file) {
                resolve(file);
              }, function(err) {reject(err);});
            });
          }, function(err) {console.log("error");console.log(err);});
        });
      });
    })
    .then(function(file) {
      assert.ok(file);
    })
    .catch(function(err) {
      throw err;
    });
  });

  it("retrieves the main url for a presentation", function() {
    var presentationUrl = "http://www.test.com/1/2/3/four.html",
    mainUrlPath = "http://www.test.com/1/2/3/",
    hash = "8b89f32fd5969662da475722f2b62cbc074e3ae4"; //mainUrlPath hash

    return platformIO.getCachedMainUrl(presentationUrl)
    .then(function(filesystemUrl) {
      assert(filesystemUrl.indexOf(hash + "/" + "four.html") > -1);
    });
  });
  
  it("checks for previously saved folder", function() {
    var mainUrlPath = "http://www.test.com/1/",
    sha1sum = "2f52a41ada769508db36bba81563c06b58b38206";
    return new Promise(function createTheFolder(resolve, reject) {
      webkitRequestFileSystem(PERSISTENT, 99000000000, function(fs) {
        fs.root.getDirectory(sha1sum, {create: true}, function(dir) {
          resolve();
        });
      });
    })
    .then(function() {
      return platformIO.hasPreviouslySavedFolder("http://www.test.com/1/");
    }).then(function(resp) {
      assert(resp);
    });
  });

  it("knows when disconnected", function() {
    assert.equal(platformIO.isNetworkConnected(), navigator.onLine);
  });
});
