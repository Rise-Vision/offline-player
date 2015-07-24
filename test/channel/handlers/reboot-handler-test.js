"use strict";
var assert = require("assert"),
handlerPath = "../../../app/player/channel/handlers/reboot-handler.js",
mock = require("simple-mock").mock,
mockPlatformProvider,
responseHandler;

describe("Reboot handler", function() {
  var validMessage = {
    player: {
      rebootRequired: "true"
    }
  };
  var ignoredMessage = {};

  beforeEach("setup mocks", function() {
    mockPlatformProvider = {};

    mock(mockPlatformProvider, "reboot").resolveWith(true);
    mock(mockPlatformProvider, "restart").resolveWith(true);

    responseHandler = require(handlerPath)(mockPlatformProvider);
  });

  it("exists", function() {
    assert.ok(responseHandler);
  });

  it("handles its event", function() {
    assert.ok(responseHandler.handles(validMessage));
  });

  it("ignores other events", function() {
    assert.ok(!responseHandler.handles(ignoredMessage));
  });

  it("successfully invokes reboot", function() {
    responseHandler.process(validMessage).then(function() {
      assert(mockPlatformProvider.reboot.called);
      assert(!mockPlatformProvider.restart.called);
    });
  });

  it("fails to reboot and falls back to restart", function() {
    mock(mockPlatformProvider, "reboot").rejectWith(false);

    responseHandler.process(validMessage).then(function() {
      assert(mockPlatformProvider.reboot.called);
      assert(mockPlatformProvider.restart.called);
    });
  });
});
