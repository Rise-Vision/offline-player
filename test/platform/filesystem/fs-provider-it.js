"use strict";
var assert = require("assert"),
platformFS = require("../../../app/player/platform/filesystem/fs-provider.js");

describe("platform filesystem provider", function() {
  it("exists", function() {
    assert.ok(platformFS, "existence");
  });
  it("saves blobs to filesystem", function() {
    var blob = new Blob([1, 2, 3]),
    url = "http://www.site.com/test/1/file1.txt",
    mainUrlPath = "http://www.site.com/test/",
    sha1sum = "be3da096623146256303ffb7cf49748b553ac61d"; //sha1sum of main url path

    return platformFS.filesystemSave(mainUrlPath, "1/file1.txt", blob)
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
      return platformFS.hasPreviouslySavedFolder("http://www.test.com/1/");
    }).then(function(resp) {
      assert(resp);
    });
  });

  it("retrieves the main url for a presentation", function() {
    var presentationUrl = "http://www.test.com/1/2/3/four.html",
    mainUrlPath = "http://www.test.com/1/2/3/",
    hash = "8b89f32fd5969662da475722f2b62cbc074e3ae4"; //mainUrlPath hash

    return platformFS.getCachedMainUrl(presentationUrl)
    .then(function(filesystemUrl) {
      assert(filesystemUrl.indexOf(hash + "/" + "four.html") > -1);
    });
  });
  
  it("knows when filesystem space is low", function() {
    return platformFS.hasFilesystemSpace()
    .then(function(resp) {
      console.log("Disk space remaining: " + resp);
      assert.ok(resp);
    });
  });
});
