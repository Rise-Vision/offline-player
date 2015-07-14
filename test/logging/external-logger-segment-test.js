"use strict";
var assert = require("assert"),
mock = require("simple-mock").mock,
segmentLoggerPath = "../../app/player/logging/external-logger-segment.js",
mockPlatformIO = {baseName: "test", baseVersion: "testversion", basePlatform: "test", version: "test", localObjectStore: {}},
serviceUrls = {segmentIOEventEndpoint: ""},
externalLogger;

mock(mockPlatformIO.localObjectStore, "get").resolveWith({displayId: "test"}); 
mock(mockPlatformIO, "httpFetcher").resolveWith(true);
externalLogger = require(segmentLoggerPath)(mockPlatformIO, {}, serviceUrls);

describe("external segment.io logger", function() {
  it("exists", function() {
    assert.ok(externalLogger);
  });

  it("can send an event", function() {
    externalLogger.sendEvent("Test");
    assert.equal(mockPlatformIO.httpFetcher.callCount, 1);
  });

  it("initializes display id", function() {
    assert.equal(mockPlatformIO.localObjectStore.get.callCount, 1);
  });

  it("uses an updated user name in subsequent event calls", function() {
    var dataBody;
    assert.ok(externalLogger.updateUserName("2j3"));

    externalLogger.sendEvent("Test");
    dataBody = JSON.parse(mockPlatformIO.httpFetcher.lastCall.args[1].body);
    assert.equal(dataBody.userId, "2j3");
  });
});
