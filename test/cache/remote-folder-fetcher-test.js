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
    return fetcher.fetchFoldersIntoFilesystem([{objectReference: "risemedialibrary-"}])
    .then(function(resp) {
      assert.equal((mockIO.getCalledParams().getRemoteFolderItemsList)[0], "risemedialibrary-");
      assert.deepEqual(fetcher.getFolderItems(), {test: "test"});
    });
  });

  it("does not fetch remote folder contents if not Rise Storage", function() {
    return fetcher.fetchFoldersIntoFilesystem([{objectReference: "some-url"}])
    .then(function(resp) {
      assert.equal(mockIO.getCalledParams().getRemoteFolderItemsList.length, 0);
      assert.deepEqual(fetcher.getFolderItems(), []);
    });
  });
});
