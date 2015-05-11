"use strict";

var assert = require("assert"),
scheduleHandler = require("../../app/player/schedule/schedule-handler.js");

describe("schedule handler", function(){
  it("exists", function(){
    assert.notEqual(scheduleHandler, undefined);
  });

  it("accepts schedule data", function(){
    scheduleHandler.setScheduleData({items: [{duration: 5}, {duration: 5}]});
    assert.equal(scheduleHandler.getScheduleData().items.length, 2);
  });

  it("accepts 'test' override for speedy integration tests", function(){
    scheduleHandler.setScheduleData({items: [{duration: 5}, {duration: 5}]});
    scheduleHandler.setScheduleData("test");
    assert.equal(scheduleHandler.getScheduleData().items[0].duration, 0);
  });

  it("shows views", function() {
    function mockView() {
      var shown = false;

      return {
        showView: function() {
          shown = true;
        },
        wasShown: function() {
          return shown === true;
        },
        hideView: function() {}
      };
    }

    var views = [mockView(), mockView()];

    scheduleHandler.cycleViews(views);
    return new Promise(function(resolve) {
      var intervalHandle = setInterval(function() {
        if (views[0].wasShown() && views[1].wasShown()) {
          clearInterval(intervalHandle);
          resolve();
        }
      }, 200);
    });
  });
});
