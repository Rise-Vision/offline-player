"use strict";
var assert = require("assert"),
handlerPath = "../../../app/player/channel/handlers/reboot-handler.js",
mock = require("simple-mock").mock,
mockRebootRestartProvider,
responseHandler;

describe("Reboot handler", function() {
  var validMessage = {
    player: {
      rebootRequired: "true"
    }
  };
  var ignoredMessage = {};

  beforeEach("setup mocks", function() {
    global.logger = {};
    mock(global.logger, "console").returnWith(true);
    mock(global.logger, "external").resolveWith(true);

    mockRebootRestartProvider = {};

    mock(mockRebootRestartProvider, "reboot").resolveWith(true);
    mock(mockRebootRestartProvider, "restart").resolveWith(true);

    responseHandler = require(handlerPath)(mockRebootRestartProvider);
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
    return responseHandler.process(validMessage).then(function() {
      assert(mockRebootRestartProvider.reboot.called);
      assert(!mockRebootRestartProvider.restart.called);

      assert.equal(global.logger.external.callCount, 1);
    });
  });

  it("fails to reboot and falls back to restart", function() {
    mock(mockRebootRestartProvider, "reboot").rejectWith(false);

    return responseHandler.process(validMessage).then(function() {
      assert(mockRebootRestartProvider.reboot.called);
      assert(mockRebootRestartProvider.restart.called);

      assert.equal(global.logger.external.callCount, 1);
    });
  });
});
