"use strict";
var assert = require("assert"),
platformIO = require("../../app/player/platform/io-provider.js"),
platformInfo = require("../../app/player/platform/platform-info.js")(),
serviceUrls = require("../main/mock-service-urls.js"),
externalLogger = require("../../app/player/logging/external-logger-bigquery.js")
(platformIO, platformInfo, serviceUrls);

describe("external logger bigquery", function() {
  it("exists", function() {
    assert.ok(externalLogger);
  });

  it("registers an event", function() {
    return externalLogger.sendEvent("Test")
    .then(function(resp) {
      return resp.json();
    }).then(function(json) {
      assert.ok(json.rows[0].insertId.length > 5);
      assert.ok(json.rows[0].json.time_millis > 0);
    });
  });
});
