"use strict";
var assert = require("assert"),
mock = require("simple-mock").mock,
platformFS = {},
platformIO = {localObjectStore: {}},
cache;


describe("cache", function() {
  beforeEach(function() {
    mock(platformFS, "checkFilesystemSpace").resolveWith(true);
    mock(platformFS, "filesystemSave").resolveWith(true);
    mock(platformFS, "getRootDirectories").resolveWith([{name: "one"}, {name: "c792012c8b8bceedfa232b8aff71e0cf09f65e89"}, {name: "three"}]);
    mock(platformFS, "removeDirectories").resolveWith();
    mock(platformFS, "getDirectory").resolveWith(true);
    mock(platformFS, "getMainFilesystemUrl").resolveWith("chrome-extension://url/");
    mock(platformIO.localObjectStore, "get").resolveWith({schedule: {items: [{objectReference: "http://the-url/"}]}});

    cache = require("../../app/player/cache/cache.js")(platformFS, platformIO);
  });

  it("exists", function() {
    assert.ok(cache);
  });

  it("caches a file", function() {
    var mainUrlHash = "3edddff2b5925cab9c8187472c4df54ca3199d08";

    return cache.cacheFileFromUrl("http://my-url/", "path/filename.html", "123")
    .then(function() {
      assert.equal(platformFS.filesystemSave.callCount, 1);
      assert.equal(platformFS.checkFilesystemSpace.callCount, 1);
      assert.deepEqual
      (platformFS.filesystemSave.lastCall.args[0], [mainUrlHash, "path"]);
      assert.deepEqual
      (platformFS.filesystemSave.lastCall.args[1], "filename.html");
      assert.deepEqual
      (platformFS.filesystemSave.lastCall.args[2], "123");
    });
  });

  it("deletes unused presentations on low space", function() {
    mock(platformFS, "checkFilesystemSpace", function() {
      return Promise.reject(new Error("testing low filesystem space"));
    });
    cache = require("../../app/player/cache/cache.js")(platformFS, platformIO);

    return cache.cacheFileFromUrl("http://my-url/", "path/index.html", "123")
    .then(function() {
      assert.deepEqual
      (platformFS.removeDirectories.lastCall.args[0], [{name: "one"}, {name: "three"}]);
      assert.equal(platformFS.checkFilesystemSpace.callCount, 2);
    });
  });

  it("checks for existing previously saved schedules", function() {
    return cache.hasPreviouslySavedSchedule("http://the-url/")
    .then(function(exists) {
      assert.ok(exists);
    });
  });

  it("checks for non-existant previously saved schedules", function() {
    mock(platformFS, "getDirectory", function() {
      return Promise.resolve(Promise.resolve(false));
    });
    cache = require("../../app/player/cache/cache.js")(platformFS, platformIO);

    return cache.hasPreviouslySavedSchedule("http://the-url/")
    .then(function(exists) {
      assert.ok(!exists);
    });
  });

  it.only("retrieves a url for a schedule", function() {
    return cache.getCachedMainScheduleObjectUrl("http://the-url/path/file")
    .then(function(url) {
      assert.equal
      (url, "chrome-extension://url/90bba7b64541bfd8802e2287570961ce52670b39/file");
    });
  });
});
