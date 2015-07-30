"use strict";
var assert = require("assert"),
providerPath = "../../app/player/platform/reboot-restart-provider.js",
provider,
mock = require("simple-mock").mock,
mockPlatformInfo,
mockContentViewController;

describe("reboot restart provider", function() {
  beforeEach("setup mocks", function() {
    global.screen = { availWidth: 100, availHeight: 100 };
    global.chrome = {
      app: { window: {} },
      runtime: {}
    };

    mockPlatformInfo = {};
    mockContentViewController = {};

    mockPlatformInfo.basePlatform = "cros";

    mock(mockContentViewController, "reloadPresentations").resolveWith(true);
    mock(global.chrome.app.window, "create").returnWith(true);
    mock(global.chrome.runtime, "restart").returnWith(true);

    provider = require(providerPath)(mockPlatformInfo, mockContentViewController);
  });

  it("exists", function() {
    assert.ok(provider);
  });

  it("reloads presentations and creates options window", function() {
    return provider.restart().then(function() {
      assert(mockContentViewController.reloadPresentations.called);
      assert(global.chrome.app.window.create.called);
    });
  });

  it("reboots the machine when running on Chrome OS", function() {
    return provider.reboot().catch(function() {
      assert(global.chrome.runtime.restart.called);
    });
  });

  it("does not reboot the machine when running on OS other than Chrome OS", function() {
    mockPlatformInfo.basePlatform = "other";

    return provider.reboot().catch(function() {
      assert(!global.chrome.runtime.restart.called);
    });
  });
});
