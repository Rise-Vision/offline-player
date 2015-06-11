"use strict";

var assert = require("assert"),
scheduleHandlerFactory = require("../../app/player/schedule/content-cycler.js");

describe("content cycler", function(){
  it("exists", function(){
    assert.notEqual(scheduleHandlerFactory(), undefined);
  });

  it("accepts schedule data", function(){
    var scheduleHandler = scheduleHandlerFactory();

    scheduleHandler.setScheduleData({items: [{duration: 5}, {duration: 5}]});
    assert.equal(scheduleHandler.getScheduleData().items.length, 2);
  });

  it("shows views", function() {
    var contentViewController = (function() {
      var shownViews = {};

      return {
        showView: function(item){shownViews[item] = true;},
        hideView: function(){},
        getShownViews: function() {return shownViews;}
      };

    }()),

    scheduleHandler = scheduleHandlerFactory(contentViewController);
    scheduleHandler.setScheduleData({items: [{duration: 0}, {duration: 0}]});
    scheduleHandler.cycleViews();

    return new Promise(function(resolve) {
      var intervalHandle = setInterval(function() {
        if (Object.keys(contentViewController.getShownViews()).length === 2) {
          clearInterval(intervalHandle);
          resolve();
        }
      }, 200);
    });
  });
});
