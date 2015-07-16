"use strict";
var assert = require("assert"),
mock = require("simple-mock").mock,
platformIO = require("../../app/player/platform/io-provider.js"),
serviceUrls = {ipAddressResolver: "http://localhost:7654/ipAddress"},
platformInfo = require("../../app/player/platform/platform-info.js")
(platformIO, serviceUrls);

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

  it("fetches IP address from an external provider", function() {
    return platformInfo.resolveIPAddress()
    .then(function() {
      assert.equal(platformInfo.ipAddress.text, "1.1.1.1");
    });
  });

  it("doesn't throw when fetch is not possible", function() {
    serviceUrls = {ipAddressResolver: "http://localhost:9999"};
    platformInfo = require("../../app/player/platform/platform-info.js")
    (platformIO, serviceUrls);

    return platformInfo.resolveIPAddress()
    .then(function() {
      assert.equal(platformInfo.ipAddress.text, "");
    });
  });
});
