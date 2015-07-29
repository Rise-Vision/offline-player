"use strict";
var assert = require("assert"),
observerPath = "../../app/player/alarms/online-status-observer.js",
observer,
alarmListeners,
mock = require("simple-mock").mock,
mockPlatformIO;

describe("online status observer", function() {
  function raiseAlarmEvent(alarm) {
    alarmListeners.forEach(function(listener) {
      listener(alarm);
    });
  }

  beforeEach("setup mocks", function() {
    alarmListeners = [];
    global.chrome = {
      alarms: {
        create: function() {
          // Empty
        },
        onAlarm: {
          addListener: function(listener) {
            alarmListeners.push(listener);
          }
        }
      }
    };

    mockPlatformIO = {};
    mock(mockPlatformIO, "isNetworkConnected").returnWith(true);

    observer = require(observerPath)(mockPlatformIO);
  });

  it("exists", function() {
    assert.ok(observer);
  });

  it("does not raise event if the status did not change", function() {
    var handler = mock();

    observer.addEventHandler(handler);

    raiseAlarmEvent({ name: "navigator.onLine.check" });
    assert(!handler.called);
  });

  it("raises event if the status changed", function() {
    var handler = mock();

    observer.addEventHandler(handler);
    mock(mockPlatformIO, "isNetworkConnected").returnWith(false);

    raiseAlarmEvent({ name: "navigator.onLine.check" });
    assert(handler.called);
  });
});
