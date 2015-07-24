"use strict";
var assert = require("assert"),
handlerPath = "../../app/player/channel/channel-manager.js",
rebootHandlerPath = "../../app/player/channel/handlers/reboot-handler.js",
restartHandlerPath = "../../app/player/channel/handlers/restart-handler.js",
mock = require("simple-mock").mock,
mockPlatformProvider,
eventData,
rebootHandler,
restartHandler,
handler;

describe("channel manager", function() {
  beforeEach("setup mocks", function() {
    mockPlatformProvider = {};
    eventData = {
      data: {
        player: {
          rebootRequired: "true"
        }
      }
    };

    rebootHandler = require(rebootHandlerPath)(mockPlatformProvider);
    restartHandler = require(restartHandlerPath)(mockPlatformProvider);

    mock(rebootHandler, "process").resolveWith(true);
    mock(restartHandler, "process").resolveWith(true);

    handler = require(handlerPath)();
  });

  it("exists", function() {
    assert.ok(handler);
  });

  it("invokes the correct handler", function() {
    handler.addEventHandler(rebootHandler);
    handler.addEventHandler(restartHandler);

    return handler.dispatchMessage(eventData).then(function() {
      assert(rebootHandler.process.called);
      assert(!restartHandler.process.called);
    });
  });
});
