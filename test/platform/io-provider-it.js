"use strict";
var assert = require("assert"),
platformIO = require("../../app/player/platform/io-provider.js");

describe("io provider platform functions", function() {
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
    return platformIO.filesystemSave("test", blob)
    .then(function() {
      assert.ok(blob, "blob test");
    });
  });

  it("retrieves blobs from filesystem", function() {
    var blob = new Blob([1, 2, 3]);
    return platformIO.filesystemSave("test", blob)
    .then(function() {
      return new Promise(function(resolve, reject) {
        webkitRequestFileSystem(PERSISTENT, 99000000000, function(fs) {
          fs.root.getFile("test", {}, function(entry) {
            entry.file(function(file) {
              resolve(file);
            });
          });
        });
      });
    })
    .then(function(resp) {
      assert.ok(URL.createObjectURL(resp).indexOf("//") > -1);
    });
  });

  it("knows when disconnected", function() {
    assert.equal(platformIO.isNetworkConnected(), navigator.onLine);
  });

  it("has a hashing method", function() {
    assert.ok(platformIO.hash);
  });
});
