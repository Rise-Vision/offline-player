"use strict";
var assert = require("assert"),
mockServiceUrls = require("../../../test/main/mock-service-urls.js"),
handlerPath = "../../../app/player/platform/content-event-handlers/client-events-listener.js",
simple = require("simple-mock"),
mock = simple.mock,
stub = simple.stub,
mockPlatformIO,
mockUIController,
mockFolderFetcher,
mockContentViewController,
clientEvents;

describe("client-events-listener", function() {
  var messageListener, gcmListener;

  function createWindowEvent(type) {
    return {
      data: {
        type: type
      }
    };
  }

  function createWindowEventHandler(type, handler) {
    return {
      handles: function(evt) { return evt.data.type === type; },
      process: handler
    };
  }

  beforeEach("setup mocks", function() {
    mockPlatformIO = {};
    mockUIController = {};
    mockFolderFetcher = {};
    mockContentViewController = {};
    mockUIController = {};
    mock(mockPlatformIO, "httpFetcher").resolveWith({});
    mock(mockPlatformIO, "isNetworkConnected").returnWith(true);
    mock(mockPlatformIO, "registerTargets").resolveWith(true);
    mock(mockUIController, "sendWindowMessage").returnWith(true);
    
    mockUIController.registerWindowListener = function(event, listener) {
      messageListener = listener;
    };

    mockPlatformIO.registerGCMListener = function(listener) {
      gcmListener = listener;
    };

    clientEvents = require(handlerPath)
    (mockServiceUrls, mockPlatformIO, mockFolderFetcher, mockContentViewController, mockUIController);
  });

  it("exists", function() {
    assert.ok(clientEvents);
  });

  it("rejects events without handlers", function(done) {
    clientEvents.resetContentEventHandlers();

    messageListener(createWindowEvent("none")).then(null, function(err) {
      assert.equal(err.name, "Error");
      assert.equal(err.message, "No handlers were found for the event");
      
      done();
    });
  });

  it("rejects events with more than one handler", function(done) {
    clientEvents.resetContentEventHandlers();
    clientEvents.addContentEventHandler(createWindowEventHandler("test1", function() {}));
    clientEvents.addContentEventHandler(createWindowEventHandler("test1", function() {}));

    messageListener(createWindowEvent("test1")).then(null, function(err) {
      assert.equal(err.name, "Error");
      assert.equal(err.message, "Only one handler can exist for the given event");
      
      done();
    });
  });
});
