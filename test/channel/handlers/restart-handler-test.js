"use strict";
var assert = require("assert"),
handlerPath = "../../../app/player/channel/handlers/restart-handler.js",
mock = require("simple-mock").mock,
mockPlatformProvider,
responseHandler;

describe("Restart handler", function() {
  var validMessage = {
    player: {
      restartRequired: "true"
    }
  };
  var ignoredMessage = {};

  beforeEach("setup mocks", function() {
    global.logger = {};
    mock(global.logger, "console").returnWith(true);
    mock(global.logger, "external").returnWith(true);

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

  it("successfully invokes restart", function() {
    return responseHandler.process(validMessage).then(function() {
      assert(!mockPlatformProvider.reboot.called);
      assert(mockPlatformProvider.restart.called);

      assert(global.logger.external.called);
      assert.equal(global.logger.external.callCount, 1);
    });
  });
});
