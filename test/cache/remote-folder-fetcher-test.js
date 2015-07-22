"use strict";
var assert = require("assert"),
mock = require("simple-mock").mock,
platformIO = {},
cache = {},
fetcher;

describe("remote folder fetcher", function() {
  beforeEach("setup mocks", function() {
    mock(platformIO, "httpFetcher").resolveWith({json: function() {
      return {items:[{folder: false, mediaLink: "test", objectId: "myFolder/tst"}]};
    }, blob: function() {return "testblob";}});
    mock(platformIO, "isNetworkConnected").returnWith(true);
    mock(cache, "hasPreviouslySavedSchedule").resolveWith(false);
    mock(cache, "cacheFileFromUrl").resolveWith(false);
    fetcher = require("../../app/player/cache/remote-folder-fetcher.js")
    (cache, platformIO, {folderContentsUrl: "test"});
  });

  it("exists", function() {
    assert.ok(fetcher);
  });

  it("fetches Rise Storage remote folder contents", function() {
    var companyId = "121212211212121212121212121212121212",
    url = "http://storage/risemedialibrary-" + companyId + "/myfolder/index.html";
    return fetcher.fetchFoldersIntoFilesystem([{objectReference: url}])
    .then(function(resp) {
      assert.equal(cache.cacheFileFromUrl.lastCall.args[1], "tst");
      assert.equal(cache.cacheFileFromUrl.lastCall.args[2], "testblob");
    });
  });

  it("does not fetch remote folder contents if not Rise Storage", function() {
    return fetcher.fetchFoldersIntoFilesystem([{objectReference: "some-url"}])
    .then(function(resp) {
      assert.equal(platformIO.httpFetcher.callCount, 0);
    });
  });

  it("does not fetch remote folder contents already present", function() {
    var companyId = "121212211212121212121212121212121212",
    url = "http://storage/risemedialibrary-" + companyId + "/myfolder/index.html";

    mock(cache, "hasPreviouslySavedSchedule", function() {
      return Promise.resolve(true);
    });

    return fetcher.fetchFoldersIntoFilesystem([{objectReference: url}])
    .then(function(resp) {
      assert.equal(platformIO.httpFetcher.callCount, 0);
    });
  });

  it("uses platform file save to save folder items", function() {
    var companyId = "121212211212121212121212121212121212", scheduleItems = [
      {objectReference: "http://risemedialibrary-" + companyId + "/1/test.html"},
      {objectReference: "http://risemedialibrary-" + companyId + "/2/index.html"},
    ];

    return fetcher.fetchFoldersIntoFilesystem(scheduleItems)
    .then(function() {
      assert.equal(platformIO.httpFetcher.callCount, 4);
      assert.equal(cache.cacheFileFromUrl.callCount, 2);
      assert.ok(cache.cacheFileFromUrl.calls.some(function(call) {
        return call.args[0] === "http://risemedialibrary-" + companyId + "/1/" &&
        call.args[1] === "Folder/tst" &&
        call.args[2] === "testblob";
      }));
    });
  });
});
