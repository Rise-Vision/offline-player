"use strict";
var assert = require("assert"),
managerPath = "../../app/player/channel/channel-manager.js",
rebootHandlerPath = "../../app/player/channel/handlers/reboot-handler.js",
restartHandlerPath = "../../app/player/channel/handlers/restart-handler.js",
mock = require("simple-mock").mock,
mockPlatformProvider,
mockTokenRetriever,
mockMessageRetriever,
mockUIController,
eventData,
rebootHandler,
restartHandler,
manager;

describe("channel manager", function() {
  beforeEach("setup mocks", function() {
    global.logger = {};
    global.document = { body: {}, view: {} };
    global.window = {};

    mock(global.logger, "console").returnWith(true);
    mock(global.logger, "external").returnWith(true);

    mockPlatformProvider = {};
    mockTokenRetriever = {};
    mockMessageRetriever = {};
    mockUIController = {};
    eventData = {
      player: {
        rebootRequired: "true"
      }
    };

    rebootHandler = require(rebootHandlerPath)(mockPlatformProvider);
    restartHandler = require(restartHandlerPath)(mockPlatformProvider);

    mock(mockTokenRetriever, "getToken").resolveWith("test-token");
    mock(mockMessageRetriever, "getMessageDetail").resolveWith(eventData);
    mock(mockUIController, "sendWindowMessage").resolveWith(true);
    mock(rebootHandler, "process").resolveWith(true);
    mock(restartHandler, "process").resolveWith(true);

    mock(document, "createElement").returnWith({
      contentWindow: {},
      style: {},
      addEventListener: function() {},
      removeEventListener: function() {}
    });

    mock(document.body, "appendChild").returnWith(true);
    mock(document.body, "removeChild").returnWith(true);
    mock(window, "addEventListener").returnWith(true);

    manager = require(managerPath)(mockTokenRetriever, mockMessageRetriever, mockUIController);
  });

  it("exists", function() {
    assert.ok(manager);
  });

  it("requests a token and creates the channel webview", function() {
    return manager.createChannel().then(function() {
      assert(mockTokenRetriever.getToken.called);
      assert(document.createElement.called);
      assert(document.body.appendChild.called);
      assert(window.addEventListener.called);
      assert(global.logger.external.called);
    });
  });

  it("only gets a new token if it does not have one", function() {
    return manager.createChannel()
    .then(manager.createChannel)
    .then(function() {
      assert.equal(mockTokenRetriever.getToken.callCount, 1);
    });
  });

  it("closes the channel and destroys the channel webview", function() {
    return manager.createChannel()
    .then(manager.destroyChannel)
    .then(function() {
      assert(document.body.removeChild.called);
      assert(mockUIController.sendWindowMessage.called);
      assert(global.logger.external.called);
    });
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
    var message = { type: "channel-error", code: "101", description: "failed"};
    var evt = { data: message };

    return manager.processMessage(evt).then(function() {
      assert(global.logger.external.called);
      assert.equal(global.logger.external.callCount, 1);
      assert(!mockTokenRetriever.getToken.called);
    });
  });

  it("requests a new token and re creates the channel", function() {
    var message = { type: "channel-error", code: "401", description: "" };
    var evt = { data: message };

    return manager.processMessage(evt).then(function() {
      assert(mockTokenRetriever.getToken.called);
      assert(global.logger.external.called);
    });
  });
});
