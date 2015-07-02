"use strict";
var assert = require("assert"),
mock = require("simple-mock").mock,
mockAnalytics = {},
trackStub,
logger;

trackStub = mock(mockAnalytics, "track").returnWith(true);
logger = require("../../app/player/logging/logger.js")(mockAnalytics);

describe("logger", function() {
  beforeEach("", function() {
    trackStub.reset();
  });

  it("exists", function() {
    assert.ok(logger);
  });

  it("logs to console", function() {
    assert.ok(logger.console("test"));
  });

  it("logs to segment", function() {
    var result = logger.segmentEvent("test");
    assert.ok(result);
    assert.equal(mockAnalytics.track.callCount, 1);
  });
});
