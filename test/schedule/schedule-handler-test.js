"use strict";

var assert = require("assert"),
scheduleHandler = require("../../app/player/schedule/schedule-handler.js");

describe("schedule handler", function(){
  it("exists", function(){
    assert.notEqual(scheduleHandler, undefined);
  });

  it("accepts schedule data", function(){
    scheduleHandler.setScheduleData({items: [{duration: 0}, {duration: 0}]});
    assert.equal(scheduleHandler.getScheduleData().items.length, 2);
  });
});
