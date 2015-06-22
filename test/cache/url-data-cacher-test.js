"use strict";
var assert = require("assert"),
dataCacherPath = "../../app/player/cache/url-data-cacher.js",
mockIOProvider,
urlDataCacher,
riseUrl = "http://risemedialibrary-323232323232323232323232323232323232/1/tst.html",
someOtherUrl = "http://somewhereelse/test.html",
mockSchedule;

describe("url data cache", function() {
  beforeEach(function() {
    mockIOProvider = require("../platform/mock-io-provider.js")();
    urlDataCacher = require(dataCacherPath)(mockIOProvider);
    mockSchedule = {items: [
      {objectReference: riseUrl},
      {objectReference: someOtherUrl}
    ]};
  });

  it("exists", function() {
    assert.ok(urlDataCacher);
  });

  it("extracts schedule urls", function() {
    var expectedUrlHashes = {};
    expectedUrlHashes[riseUrl] = "";
    expectedUrlHashes[someOtherUrl] = "";
    urlDataCacher.setSchedule(mockSchedule);
    assert.deepEqual(urlDataCacher.getUrlHashes(), expectedUrlHashes);
  });

  it("doesn't try to retrieve files that aren't stored on RiseStorage", function() {
    urlDataCacher.setSchedule(mockSchedule);

    return urlDataCacher.fetchUrlDataIntoFilesystem()
    .then(function() {
      assert.equal(mockIOProvider.getCalledParams().httpFetcher.length, 1);
    });
  });

  it("saves the url data and retains hashes as filenames", function() {
    var sha1sums = {};
    sha1sums[riseUrl] = "784b8f947401fa3606e4451e1a6c7314f0bdf107";

    urlDataCacher.setSchedule(mockSchedule);

    return urlDataCacher.fetchUrlDataIntoFilesystem()
    .then(function() {
      assert.deepEqual(mockIOProvider.getCalledParams().httpFetcher, [riseUrl]);

      assert.equal(urlDataCacher.getUrlHashes()[riseUrl], sha1sums[riseUrl]);

      assert.deepEqual((mockIOProvider.getCalledParams().filesystemSave),
      [[sha1sums[riseUrl] + ".html", "mock-blob"]]);
    });
  });
});
