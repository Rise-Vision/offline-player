"use strict";

var assert = require("assert"),
scheduleLoaderFactory = require("../../app/player/schedule/local-schedule-loader.js");

describe("local schedule loader", function(){
  it("exists", function(){
    assert.notEqual(scheduleLoaderFactory(), undefined);
  });

  it("loads schedule", function() {
    var xhr = (function() {
      var callback;

      return {
        response: {
          content: {schedule: "test"}
        },

        open: function() {
        },

        send: function() {
          callback();
        },

        addEventListener: function(eventName, func) {
          callback = func;
        }
      };
    }()),
    scheduleLoader = scheduleLoaderFactory(xhr); 

    return scheduleLoader.loadSchedule()
    .then(function(resp) {
      assert.equal(resp, "test");
    });
  });
});
