"use strict";
var assert = require("assert"),
remoteFolderFetcherMock = require("../cache/mock-remote-folder-fetcher.js")(),
listenerProvider = require("../../app/player/cache/external-fetch-listener.js")
(remoteFolderFetcherMock);

describe("external fetch listener", function() {
  it("exists", function() {
    assert.ok(listenerProvider);
  });

  it("provides listeners", function() {
    assert.ok(listenerProvider.createListener("hash"));
  });

  it("provides listeners that return redirects for cached items", function() {
    var listener = listenerProvider.createListener("urlHash");
    assert.deepEqual(listener({url: "http://xxxx/url"}), {redirectUrl: "localUrl"});
  });

  it("provides listeners that do not return redirects for uncached items",
  function() {
    var listener = listenerProvider.createListener("someOtherHash");
    assert.deepEqual(listener({url: "url"}), {});
    listener = listenerProvider.createListener("urlHash");
    assert.deepEqual(listener({url: "someOtherUrl"}), {});
  });
});
