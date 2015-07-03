"use strict";
var assert = require("assert"),
platformIO = require("../../app/player/platform/io-provider.js"),
segmentLogger = require("../../app/player/logging/external-logger-segment.js")
(platformIO);

describe("segment logger", function() {
  it("exists", function() {
    assert.ok(segmentLogger);
  });

  it("registers a segment event", function() {
    return segmentLogger.sendEvent("Test")
    .then(function(resp) {
      assert.ok(resp.ok);
    });
  });
});
