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
    var companyId = "121212211212121212121212121212121212",
    url = "http://storage/risemedialibrary-" + companyId + "/myfolder/index.html";
    return fetcher.fetchFoldersIntoFilesystem([{objectReference: url}])
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

  it("saves items to filesystem as <filePathHash>.ext", function() {
    var companyId = "121212211212121212121212121212121212", scheduleItems = [
      {objectReference: "http://risemedialibrary-" + companyId + "/1/test.html"},
      {objectReference: "http://risemedialibrary-" + companyId + "/2/index.html"},
    ],
    sha1sum = "42afffb9af8bfab45f29874ce39cc8d74353a2fd";
    /*http://risemedialibrary-1212122112...../filePath2/file.txt*/
    return fetcher.fetchFoldersIntoFilesystem(scheduleItems)
    .then(function() {
      assert.equal(mockIO.getCalledParams().httpFetcher.length, 4);
      assert.equal(mockIO.getCalledParams().filesystemSave.length, 4);
      assert.ok(mockIO.getCalledParams().filesystemSave.some(function(params) {
        return params[0] === sha1sum + ".txt";
      }));
    });
  });

  it("retains a list of all folder items and local urls", function() {
    var companyId = "121212211212121212121212121212121212", scheduleItems = [
      {objectReference: "http://risemedialibrary-" + companyId + "/index.html"}
    ];

    return fetcher.fetchFoldersIntoFilesystem(scheduleItems)
    .then(function() {
      var localStorageSetParam = mockIO.getCalledParams().localStorage.set; 
      assert.equal(Object.keys(localStorageSetParam).length, 1);
    });
  });

  it("refreshes existing urls (because urls are invalidated after restart)",
  function() {
    mockIO = require("../platform/mock-io-provider.js")({
      disconnected: true,
      localStorageGetResult: {
        "http://storage/risemedialibrary-121212211212121212121212121212121212/": [
          {url: "url1", filePath: "tst1.css", localUrl: "localUrl1", file: "file1"},
          {url: "url2", filePath: "tst2.css", localUrl: "localUrl2", file: "file2"}
        ]
      }
    });

    fetcher = require("../../app/player/cache/remote-folder-fetcher.js")(mockIO);
    var cid = "121212211212121212121212121212121212",
    mainUrl = "http://storage/risemedialibrary-" + cid + "/test.html",
    mainUrlPath = "http://storage/risemedialibrary-" + cid + "/",
    scheduleItems = [
      {objectReference: mainUrl}
    ],
    sha1sum = "432f431b805267ad60553509e8d7697d60ea8d9c";
 /*http://storage/risemedialibrary-121212211212121212121212121212121212/tst2.css*/

    return fetcher.fetchFoldersIntoFilesystem(scheduleItems)
    .then(function() {
      var folderItems = fetcher.getFolderItems();
      assert.equal(folderItems[mainUrlPath][1].localUrl,
      "url-for-" + sha1sum + ".css");
    });
  });
});
