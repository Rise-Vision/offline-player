"use strict";

var assert = require("assert"),
contentViewCreator = require("../../app/player/schedule/content-view-creator.js");

describe("content view creator", function(){
  it("exists", function(){
    assert.notEqual(contentViewCreator, undefined);
  });
});

