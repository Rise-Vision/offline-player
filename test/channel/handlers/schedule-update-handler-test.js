"use strict";
var assert = require("assert"),
handlerPath = "../../../app/player/channel/handlers/schedule-update-handler.js",
mock = require("simple-mock").mock,
mockPlatformIO,
responseHandler;

describe("schedule update handler", function() {
  function createSchedule(name) {
    return {
      id: "796bbccb-ccbf-4f3b-91c8-884201673188",
      name: name
    };
  }

  function createScheduleMessage(name) {
    return {
      content: {
        schedule: createSchedule(name)
      }      
    };
  }

  beforeEach("setup mocks", function() {
    global.logger = {};
    mock(global.logger, "console").returnWith(true);
    mock(global.logger, "external").returnWith(true);

    mockPlatformIO = { localObjectStore: {} };
    mock(mockPlatformIO.localObjectStore, "get").resolveWith({ schedule: createSchedule("test1") });
    mock(mockPlatformIO.localObjectStore, "set").resolveWith(true);

    responseHandler = require(handlerPath)(mockPlatformIO);
  });

  it("exists", function() {
    assert.ok(responseHandler);
  });

  it("handles its event", function() {
    assert.ok(responseHandler.handles(createScheduleMessage("test1")));
  });

  it("ignores other events", function() {
    var ignoredMessage = {
      player: {
        rebootRequired: "true"
      }
    };

    assert.ok(!responseHandler.handles(ignoredMessage));
  });

  it("updates local storage if schedule changed", function() {
    return responseHandler.process(createScheduleMessage("test2")).then(function() {
      assert(mockPlatformIO.localObjectStore.get.called);
      assert(mockPlatformIO.localObjectStore.set.called);

      assert.equal(global.logger.external.callCount, 1);
    });
  });

  it("does not update local storage if schedule did not change", function() {
    return responseHandler.process(createScheduleMessage("test1")).catch(function() {
      assert(mockPlatformIO.localObjectStore.get.called);
      assert(!mockPlatformIO.localObjectStore.set.called);

      assert.equal(global.logger.external.callCount, 0);
    });
  });
});
