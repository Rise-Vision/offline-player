"use strict";
var assert = require("assert"),
managerPath = "../../app/player/channel/channel-manager.js",
rebootHandlerPath = "../../app/player/channel/handlers/reboot-handler.js",
restartHandlerPath = "../../app/player/channel/handlers/restart-handler.js",
mock = require("simple-mock").mock,
mockPlatformProvider,
mockMessageRetriever,
mockUIController,
eventData,
rebootHandler,
restartHandler,
manager;

describe("channel manager", function() {
  beforeEach("setup mocks", function() {
    global.logger = {};
    mock(global.logger, "console").returnWith(true);
    mock(global.logger, "external").returnWith(true);

    mockPlatformProvider = {};
    mockMessageRetriever = {};
    mockUIController = {};
    eventData = {
      player: {
        rebootRequired: "true"
      }
    };

    rebootHandler = require(rebootHandlerPath)(mockPlatformProvider);
    restartHandler = require(restartHandlerPath)(mockPlatformProvider);

    mock(mockMessageRetriever, "getMessageDetail").resolveWith(eventData);
    mock(mockUIController, "sendWindowMessage").resolveWith(true);
    mock(rebootHandler, "process").resolveWith(true);
    mock(restartHandler, "process").resolveWith(true);

    manager = require(managerPath)(mockMessageRetriever, mockUIController);
  });

  it("exists", function() {
    assert.ok(manager);
  });

  it("invokes the correct handler", function() {
    var message = { type: "channel-message", message: "updated FGHJK"};
    var evt = { data: message };

    manager.addEventHandler(rebootHandler);
    manager.addEventHandler(restartHandler);

    return manager.processMessage(evt).then(function() {
      assert(rebootHandler.process.called);
      assert(!restartHandler.process.called);

      assert(global.logger.external.called);
      assert.equal(global.logger.external.callCount, 1);
    });
  });

  it("handles AYT message", function() {
    var message = { type: "channel-message", message: "ayt"};
    var evt = { data: message };

    manager.addEventHandler(rebootHandler);
    manager.addEventHandler(restartHandler);

    return manager.processMessage(evt).then(function() {
      assert(mockUIController.sendWindowMessage.called);
      assert.equal(mockUIController.sendWindowMessage.lastCall.args[1].type, "reset-channel");

      assert(global.logger.external.called);
      assert.equal(global.logger.external.callCount, 2);

      assert(!rebootHandler.process.called);
      assert(!restartHandler.process.called);
    });
  });

  it("handles connected event", function() {
    var message = { type: "channel-event", message: "connected"};
    var evt = { data: message };

    return manager.processMessage(evt).then(function() {
      assert(global.logger.external.called);
      assert.equal(global.logger.external.callCount, 1);
    });
  });

  it("handles closed event", function() {
    var message = { type: "channel-event", message: "closed"};
    var evt = { data: message };

    return manager.processMessage(evt).then(function() {
      assert(global.logger.external.called);
      assert.equal(global.logger.external.callCount, 1);
    });
  });

  it("handles channel errors", function() {
    var message = { type: "channel-error", code: 101, description: "failed"};
    var evt = { data: message };

    return manager.processMessage(evt).then(function() {
      assert(global.logger.external.called);
      assert.equal(global.logger.external.callCount, 1);
    });
  });
});
