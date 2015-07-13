"use strict";
var assert = require("assert"),
mock = require("simple-mock").mock,
platformIO = {},
platformFS = {},
fetcher;

describe("remote folder fetcher", function() {
  beforeEach("setup mocks", function() {
    mock(platformIO, "httpFetcher").resolveWith(true);
    mock(platformIO, "getRemoteFolderItemsList").resolveWith([]);
    mock(platformIO, "filesystemSave").resolveWith([]);
    mock(platformIO, "filesystemRetrieve").resolveWith([]);
    mock(platformIO, "isNetworkConnected").returnWith(true);
    mock(platformFS, "hasPreviouslySavedFolder").resolveWith(false);
    mock(platformFS, "hasFilesystemSpace").resolveWith(true);
    fetcher = require("../../app/player/cache/remote-folder-fetcher.js")
    (platformFS, platformIO);
  });

  it("exists", function() {
    assert.ok(fetcher);
  });

  it.only("fetches Rise Storage remote folder contents", function() {
    var companyId = "121212211212121212121212121212121212",
    url = "http://storage/risemedialibrary-" + companyId + "/myfolder/index.html";
    return fetcher.fetchFoldersIntoFilesystem([{objectReference: url}])
    .then(function(resp) {
      assert.equal(platformIO.getRemoteFolderItemsList.lastCall.args[0], url);
    });
  });

  it("does not fetch remote folder contents if not Rise Storage", function() {
    return fetcher.fetchFoldersIntoFilesystem([{objectReference: "some-url"}])
    .then(function(resp) {
      assert.equal(platformIO.getRemoteFolderItemsList.callCount, 0);
    });
  });

  it("does not fetch remote folder contents already present", function() {
    var companyId = "121212211212121212121212121212121212",
    url = "http://storage/risemedialibrary-" + companyId + "/myfolder/index.html";

    mock(platformIO, "hasPreviouslySavedFolder", function() {
      return Promise.resolve(true);
    });

    return fetcher.fetchFoldersIntoFilesystem([{objectReference: url}])
    .then(function(resp) {
      assert.equal(platformIO.getRemoteFolderItemsList.callCount, 0);
    });
  });

  it("uses platform file save to save folder items", function() {
    var companyId = "121212211212121212121212121212121212", scheduleItems = [
      {objectReference: "http://risemedialibrary-" + companyId + "/1/test.html"},
      {objectReference: "http://risemedialibrary-" + companyId + "/2/index.html"},
    ];

    mock(platformIO, "getRemoteFolderItemsList", function() {
      return Promise.resolve([
          {remoteUrl: "url1", filePath: "file1"},
          {remoteUrl: "url2", filePath: "filePath2/file.txt"}
      ]);
    });
    mock(platformIO, "httpFetcher", function() {
      return Promise.resolve({
        blob: function() {return Promise.resolve("mock-blob");}
      });
    });

    return fetcher.fetchFoldersIntoFilesystem(scheduleItems)
    .then(function() {
      assert.equal(platformIO.httpFetcher.callCount, 4);
      assert.equal(platformIO.filesystemSave.callCount, 4);
      assert.ok(platformIO.filesystemSave.calls.some(function(call) {
        return call.args[0] === "http://risemedialibrary-" + companyId + "/1/" &&
        call.args[1] === "filePath2/file.txt" &&
        call.args[2] === "mock-blob";
      }));
    });
  });

  it("refuses to save if disk space is low", function() {
    var companyId = "121212211212121212121212121212121212", scheduleItems = [
      {objectReference: "http://risemedialibrary-" + companyId + "/1/test.html"},
      {objectReference: "http://risemedialibrary-" + companyId + "/2/index.html"},
    ];

    mock(platformIO, "hasFilesystemSpace", function() {
      return Promise.reject(new Error("Disk space is below 500MB"));
    });

    return fetcher.fetchFoldersIntoFilesystem(scheduleItems)
    .then(function(resp) {
      assert.equal(platformIO.getRemoteFolderItemsList.callCount, 0);
      assert.ok(/disk space/i.test(resp));
    });
  });
});
