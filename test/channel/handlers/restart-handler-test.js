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
    mockPlatformProvider = {};

    mock(mockPlatformProvider, "reboot").resolveWith(true);
    mock(mockPlatformProvider, "restart").resolveWith(true);

    responseHandler = require(handlerPath)(mockPlatformProvider);
  });

  it("exists", function() {
    assert.ok(responseHandler);
  });

  it("handles its event", function() {
    var eventObject = {
      data: validMessage
    };
    assert.ok(responseHandler.handles(eventObject));
  });

  it("ignores other events", function() {
    var eventObject = {
      data: ignoredMessage
    };
    assert.ok(!responseHandler.handles(eventObject));
  });

  it("successfully invokes restart", function() {
    var eventObject = {
      data: validMessage
    };

    responseHandler.process(eventObject).then(function() {
      assert(!mockPlatformProvider.reboot.called);
      assert(mockPlatformProvider.restart.called);
    });
  });
});
