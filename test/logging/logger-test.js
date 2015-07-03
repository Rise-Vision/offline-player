"use strict";
var assert = require("assert"),
mock = require("simple-mock").mock,
mockExternalLogger = {},
logger;

mock(mockExternalLogger, "sendEvent").returnWith(true);
logger = require("../../app/player/logging/logger.js")(mockExternalLogger);

describe("logger", function() {
  it("exists", function() {
    assert.ok(logger);
  });

  it("logs to console", function() {
    assert.ok(logger.console("test"));
  });

  it("logs to segment", function() {
    var result = logger.external("test");
    assert.ok(result);
    assert.equal(mockExternalLogger.sendEvent.callCount, 1);
  });
});
