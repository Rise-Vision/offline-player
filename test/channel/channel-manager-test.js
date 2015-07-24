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
    });
  });

  it("handles AYT message", function() {
    var message = { type: "channel-message", message: "ayt"};
    var evt = { data: message };

    manager.addEventHandler(rebootHandler);
    manager.addEventHandler(restartHandler);

    return manager.processMessage(evt).then(function() {
      assert(mockUIController.sendWindowMessage.called);
      assert(!rebootHandler.process.called);
      assert(!restartHandler.process.called);
    });
  });
});
