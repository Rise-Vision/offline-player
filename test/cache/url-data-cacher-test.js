"use strict";
var assert = require("assert"),
dataCacherPath = "../../app/player/cache/url-data-cacher.js",
mockIOProvider,
urlDataCacher,
mockSchedule;

describe("url data cache", function() {
  beforeEach(function() {
    mockIOProvider = require("../platform/mock-io-provider.js")();
    urlDataCacher = require(dataCacherPath)(mockIOProvider);
    mockSchedule = {items: [{objectReference: "A"}, {objectReference: "B"}]};
  });

  it("exists", function() {
    assert.ok(urlDataCacher);
  });

  it("extracts schedule urls", function() {
    urlDataCacher.setSchedule(mockSchedule);
    assert.deepEqual(urlDataCacher.getUrlHashes(), {"A": "", "B": ""});
  });

  it("doesn't try to retrieve a local file", function() {
    mockSchedule.items[0].objectReference = "../not a remote url";

    urlDataCacher.setSchedule(mockSchedule);

    return urlDataCacher.fetchUrlDataIntoFilesystem()
    .then(function() {
      assert.equal(mockIOProvider.getCalledParams().httpFetcher.length, 1);
    });
  });

  it("saves the url data and retains hashes as filenames", function() {
    var sha1sums = {
      A: "6dcd4ce23d88e2ee9568ba546c007c63d9131c1b",
      B: "ae4f281df5a5d0ff3cad6371f76d5c29b6d953ec"
    };

    urlDataCacher.setSchedule(mockSchedule);

    return urlDataCacher.fetchUrlDataIntoFilesystem()
    .then(function() {
      assert.deepEqual(mockIOProvider.getCalledParams().httpFetcher, ["A", "B"]);

      assert.equal(urlDataCacher.getUrlHashes().A, sha1sums.A);
      assert.equal(urlDataCacher.getUrlHashes().B, sha1sums.B);

      assert.deepEqual((mockIOProvider.getCalledParams().filesystemSave),
      [[sha1sums.A, "html", "mock-blob"],
      [sha1sums.B, "html", "mock-blob"]]);
    });
  });
});
