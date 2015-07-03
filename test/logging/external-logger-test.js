"use strict";
var assert = require("assert"),
mock = require("simple-mock").mock,
segementLoggerPath = "../../app/player/logging/external-logger-segment.js",
mockPlatformIO = {localObjectStore: {}},
fetchStub = mock(mockPlatformIO, "httpFetcher").resolveWith(true),
localStorageStub = mock(mockPlatformIO.localObjectStore, "get").resolveWith("123"),
externalLogger = require(segementLoggerPath)(mockPlatformIO);

describe("external logger", function() {
  beforeEach("reset mocks", function() {
    fetchStub.reset();
  });

  it("exists", function() {
    assert.ok(externalLogger);
  });

  it.only("can send an event", function() {
    assert.ok(externalLogger.sendEvent("Test"));
  });
});
