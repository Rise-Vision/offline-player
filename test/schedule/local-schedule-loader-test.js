"use strict";

var assert = require("assert"),
scheduleLoader = require("../../app/player/schedule/local-schedule-loader.js");

describe("local schedule loader", function(){
  it("exists", function(){
    assert.notEqual(scheduleLoader, undefined);
  });
});
