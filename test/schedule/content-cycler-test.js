"use strict";

var assert = require("assert"),
scheduleHandlerFactory = require("../../app/player/schedule/content-cycler.js"),
scheduleData = {
  items: [
    {duration: 0, objectReference: "test1"},
    {duration: 0, objectReference: "test2"}
  ]
};

describe("content cycler", function(){
  it("exists", function(){
    assert.notEqual(scheduleHandlerFactory(), undefined);
  });

  it("accepts schedule data", function(){
    var scheduleHandler = scheduleHandlerFactory();

    scheduleHandler.setScheduleData(scheduleData);
    assert.equal(scheduleHandler.getScheduleData().items.length, 2);
  });

  it("shows views", function() {
    var contentViewController = (function() {
      var shownViews = {};

      return {
        showView: function(item){shownViews[item] = true;},
        hideView: function(){},
        getShownViewCount: function() {return Object.keys(shownViews).length;}
      };

    }()),

    scheduleHandler = scheduleHandlerFactory(contentViewController);
    scheduleHandler.setScheduleData(scheduleData);
    scheduleHandler.cycleViews();

    return new Promise(function(resolve) {
      var intervalHandle = setInterval(function() {
        if (contentViewController.getShownViewCount() === 2) {
          clearInterval(intervalHandle);
          resolve();
        }
      }, 200);
    });
  });
});
