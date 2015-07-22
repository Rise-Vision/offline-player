"use strict";
var assert = require("assert"),
mock = require("simple-mock").mock,
externalLoggerPath = "../../app/player/logging/external-logger-bigquery.js",
mockPlatformInfo = {baseVersion: "1", basePlatform: {os: "2a", arch: "2b"}, version: "3", ipAddress: {text: "4"}},
mockPlatformIO = {localObjectStore: {}},
serviceUrls = {externalLog: "http://api/TABLE_ID/insert"},
externalLogger;

mock(mockPlatformIO.localObjectStore, "get").resolveWith({displayId: "test"}); 
mock(mockPlatformIO, "httpFetcher").resolveWith({json: function() {return Promise.resolve({access_token: "test-token"});}});
externalLogger = require(externalLoggerPath)
(mockPlatformIO, mockPlatformInfo, serviceUrls);

describe("external segment.io logger", function() {
  it("exists", function() {
    assert.ok(externalLogger);
  });

  it("can send an event", function() {
    externalLogger.sendEvent("Test");
    assert.equal(mockPlatformIO.httpFetcher.callCount, 1);
  });

  it("initializes display id", function() {
    mockPlatformIO.localObjectStore.get.reset();
    externalLogger = require(externalLoggerPath)
    (mockPlatformIO, mockPlatformInfo, serviceUrls);

    assert.equal(mockPlatformIO.localObjectStore.get.callCount, 1);
  });

  it("fetches a token", function() {
    return externalLogger.sendEvent("test")
    .then(function() {
      assert.ok
      (/test-token/.test(mockPlatformIO.httpFetcher.lastCall.args[1].headers[1]));
    });
  });

  it("uses a date based table name", function() {
    assert.ok(!/events[0-9]{8}/.test(serviceUrls.externalLog));

    return externalLogger.sendEvent("test")
    .then(function() {
      assert.ok
      (/events[0-9]{8}/.test(mockPlatformIO.httpFetcher.lastCall.args[0]));
    });
  });

  it("uses an updated user name in subsequent event calls", function() {
    var dataBody;
    assert.ok(externalLogger.updateDisplayId("2j3"));

    return externalLogger.sendEvent("Test")
    .then(function() {
      dataBody = JSON.parse(mockPlatformIO.httpFetcher.lastCall.args[1].body);
      assert.equal(dataBody.rows[0].json.display_id, "2j3");
    });
  });
});
