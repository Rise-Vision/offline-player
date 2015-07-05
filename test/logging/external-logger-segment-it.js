"use strict";
var assert = require("assert"),
platformIO = require("../../app/player/platform/io-provider.js"),
serviceUrls = require("../main/mock-service-urls.js"),
segmentLogger = require("../../app/player/logging/external-logger-segment.js")
(platformIO, serviceUrls);

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
