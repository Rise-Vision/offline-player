"use strict";
var assert = require("assert"),
mockIO,
fetcher;

describe("remote folder fetcher", function() {
  beforeEach("setup mocks", function() {
    mockIO = require("../platform/mock-io-provider.js")();
    fetcher = require("../../app/player/cache/remote-folder-fetcher.js")(mockIO);
  });

  it("exists", function() {
    assert.ok(fetcher);
  });

  it("fetches Rise Storage remote folder contents", function() {
    var url = "risemedialibrary-";
    return fetcher.fetchFoldersIntoFilesystem([{objectReference: "risemedialibrary-"}])
    .then(function(resp) {
      assert.equal((mockIO.getCalledParams().getRemoteFolderItemsList)[0], url);
    });
  });

  it("does not fetch remote folder contents if not Rise Storage", function() {
    return fetcher.fetchFoldersIntoFilesystem([{objectReference: "some-url"}])
    .then(function(resp) {
      assert.equal(mockIO.getCalledParams().getRemoteFolderItemsList.length, 0);
      assert.deepEqual(fetcher.getFolderItems(), []);
    });
  });

  it("saves items to filesystem as <mainurlhash>path|to|file.txt>", function() {
    var scheduleItems = [
      {objectReference: "risemedialibrary-url-1/"},
      {objectReference: "risemedialibrary-url-2"},
      {objectReference: "risemedialibrary-url-3"}
    ],
    sha1sumUrl2 = "328495a9c79a2f11aa32397fc8c4dcf1b5de220d"; 

    return fetcher.fetchFoldersIntoFilesystem(scheduleItems)
    .then(function() {
      assert.equal(mockIO.getCalledParams().httpFetcher.length, 9);
      assert.equal(mockIO.getCalledParams().filesystemSave.length, 9);
      assert.ok(mockIO.getCalledParams().filesystemSave.some(function(params) {
        return params[0] === sha1sumUrl2 + "filePath2|file";
      }));
    });
  });

  it("retains a list of all folder items and local urls", function() {
    var scheduleItems = [
      {objectReference: "risemedialibrary-url-1/"}
    ];

    return fetcher.fetchFoldersIntoFilesystem(scheduleItems)
    .then(function() {
      var localStorageSetParam = mockIO.getCalledParams().localStorage.set; 
      assert.equal(Object.keys(localStorageSetParam).length, 1);
    });
  });
});
