"use strict";

var assert = require("assert"),
starter = require("../../app/player/schedule/start.js");

describe("starter", function(){
  it("exists", function(){
    assert.notEqual(starter, undefined);
  });

  it("starts the schedule when properly called", function(){
    var localScheduleLoader = {
      loadSchedule: function() {
       return new Promise(function(resolve) {resolve({items:[]});});
      }
    },
    scheduleHandlerFactory = function() {
      return {
        setScheduleData: function() {},
        cycleViews: function() {}
      };
    },
    contentViewController = {
      createContentViews: function() {}
    };

    return starter.start
    (localScheduleLoader, scheduleHandlerFactory, contentViewController);
  });
});
