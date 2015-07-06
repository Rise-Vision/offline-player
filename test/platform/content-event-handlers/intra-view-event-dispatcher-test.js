"use strict";
var assert = require("assert"),
handlerPath = "../../../app/player/platform/content-event-handlers/intra-view-event-dispatcher.js",
mock = require("simple-mock").mock,
mockUIController,
mockContentViewController,
eventDispatcher;

describe("intra-view-event-dispatcher", function() {
  function createWindowEventHandler(type, handler) {
    return {
      handles: function(evt) { return evt.data.type === type; },
      process: handler
    };
  }

  function createWindowEvent(type) {
    return { data: { type: type } };
  }

  beforeEach("setup mocks", function() {
    mockUIController = {};
    mockContentViewController = {};
    mock(mockContentViewController, "getViewUrl").returnWith("view-url");
    mock(mockUIController, "sendWindowMessage").returnWith(true);
    mock(mockUIController, "registerWindowListener").returnWith(true);

    eventDispatcher = require(handlerPath)(mockContentViewController, mockUIController);
  });

  it("exists", function() {
    assert.ok(eventDispatcher);
  });

  it("dispatches to the correct handler with the event and source", function() {
    var handled = false,
    eventParam,
    sourceParam,
    eventHandler = createWindowEventHandler("test-event", function(evt, src) {
      handled = true;
      eventParam = evt;
      sourceParam = src;
    });

    eventDispatcher.addEventHandler(eventHandler);
    eventDispatcher.dispatch(createWindowEvent("test-event"));
    assert.equal(handled, true);
    assert.equal(eventParam.data.type, "test-event");
    assert.equal(sourceParam, "view-url");
  });

  it("rejects events without handlers", function() {
    eventDispatcher.resetEventHandlers();

    return eventDispatcher.dispatch(createWindowEvent("none"))
    .catch(function(err) {
      assert.equal(err.name, "Error");
      assert.equal(err.message, "No handlers were found for the event");
      assert.equal(mockUIController.sendWindowMessage.callCount, 1);
    });
  });

  it("rejects events with more than one handler", function() {
    eventDispatcher.resetEventHandlers();
    eventDispatcher.addEventHandler(createWindowEventHandler("test1", function() {}));
    eventDispatcher.addEventHandler(createWindowEventHandler("test1", function() {}));

    return eventDispatcher.dispatch(createWindowEvent("test1")).then(null, function(err) {
      assert.equal(err.name, "Error");
      assert.equal(err.message, "Only one handler can exist for the given event");
    });
  });
});
