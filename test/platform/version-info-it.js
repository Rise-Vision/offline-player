"use strict";
var assert = require("assert"),
platformInfo = require("../../app/player/platform/version-info.js");

describe("platform info", function() {
  it("exist", function() {
    assert.ok(platformInfo);
  });

  it("provides version info", function() {
    assert.ok(/[0-9]+/.test(platformInfo.version));
  });

  it("contains the platform name", function() {
    assert.ok(platformInfo.name);
  });

  it("contains the base name", function() {
    assert.ok(platformInfo.baseName);
  });

  it("contains the base version", function() {
    assert.ok(platformInfo.baseVersion);
  });

  it("contains the base platform description", function() {
    assert.ok(platformInfo.basePlatform);
  });
});
