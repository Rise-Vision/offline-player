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

    return platformFS.filesystemSave([sha1sum, "one"], "file1.txt", blob)
    .then(function(resp) {
      return new Promise(function(resolve, reject) {
        webkitRequestFileSystem(PERSISTENT, 99000000000, function(fs) {
          fs.root.getDirectory(sha1sum, {create: false}, function(dir) {
            dir.getDirectory("one", {create: false}, function(dir) {
              dir.getFile("file1.txt", {create: false}, function(file) {
                resolve(file);
              }, function(err) {reject(err);});
            });
          }, function(err) {console.log("error");console.log(err.message);});
        });
      });
    })
    .then(function(file) {
      assert.ok(file);
    });
  });

  it("retrieves a directory", function() {
    var dirPath = ["part1", "part2"];
    return new Promise(function createTheDirectory(resolve, reject) {
      webkitRequestFileSystem(PERSISTENT, 99000000000, function(fs) {
        fs.root.getDirectory(dirPath[0], {create: true}, function(dir) {
          dir.getDirectory(dirPath[1], {create: true}, function() {
            resolve();
          });
        });
      });
    })
    .then(function() {
      return platformFS.getDirectory("part1/part2");
    }).then(function(resp) {
      assert.equal(resp.name, "part2");
    });
  });

  it("retrieves the url to the main filesystem", function() {
    return platformFS.getMainFilesystemUrl()
    .then(function(filesystemUrl) {
      assert.ok(/chrome-extension/.test(filesystemUrl));
    });
  });
  
  it("knows when filesystem space is sufficient", function() {
    return platformFS.checkFilesystemSpace(0)
    .then(function(resp) {
      console.log("Disk space remaining: " + resp);
      assert.ok(resp);
    });
  });

  it("knows when filesystem space is not sufficient", function() {
    return platformFS.checkFilesystemSpace(100000000000)
    .then(function(resp) {
      assert.ok(false);
    })
    .catch(function() {
      assert.ok(true);
    });
  });

  it("returns all root directories", function() {
    return new Promise(function createTheDirectories(resolve, reject) {
      webkitRequestFileSystem(PERSISTENT, 99000000000, function(fs) {
        fs.root.getDirectory("one", {create: true}, function() {
          fs.root.getDirectory("two", {create: true}, function() {
            resolve();
          });
        });
      });
    })
    .then(platformFS.getRootDirectories)
    .then(function(dirs) {
      assert.ok(dirs.some(function(dir){return dir.name === "one";}));
      assert.ok(dirs.some(function(dir){return dir.name === "two";}));
    });
  });

  it("removes directories and all their contents", function() {
    var dir1, dir2, dir3;
    return new Promise(function createTheContents(resolve, reject) {
      webkitRequestFileSystem(PERSISTENT, 99000000000, function(fs) {
        fs.root.getDirectory("one", {create: true}, function(dir) {
          dir1 = dir;
          dir.getFile("file1", {create: true}, function(){
            fs.root.getDirectory("two", {create: true}, function(dir) {
              dir2 = dir;
              dir.getDirectory("three", {create: true}, function(dir) {
                dir3 = dir;
                dir.getFile("file2", {create: true}, function() {
                  resolve();
                });
              });
            });
          });
        });
      });
    })
    .then(function() {
      assert.ok(dir1);
      assert.ok(dir2);
      assert.ok(dir3);
    })
    .then(function() {
      return platformFS.removeDirectories([dir1, dir2, dir3]);
    })
    .then(function() {
      return new Promise(function verifyRemoval(resolve, reject) {
        webkitRequestFileSystem(PERSISTENT, 99000000000, function(fs) {
          fs.root.getDirectory
          ("one", {create: false}, function(dir) {}, function() {resolve();});
        });
      });
    })
    .then(function() {
      return new Promise(function verifyRemoval(resolve, reject) {
        webkitRequestFileSystem(PERSISTENT, 99000000000, function(fs) {
          fs.root.getDirectory
          ("two", {create: false}, function(dir) {}, function() {resolve();});
        });
      });
    })
    .then(function() {
      return new Promise(function verifyRemoval(resolve, reject) {
        webkitRequestFileSystem(PERSISTENT, 99000000000, function(fs) {
          fs.root.getDirectory
          ("three", {create: false}, function(dir) {}, function() {resolve();});
        });
      });
    });
  });
});
