"use strict";

var assert = require("assert"),
platformIOFunctions = require("../platform/mock-io-provider.js"),
retrieverPath = "../../app/player/schedule/remote-schedule-retriever.js",
retriever = require(retrieverPath)(platformIOFunctions, {scheduleFetchUrl: ""});

describe("remote schedule retriever", function(){
  it("exists", function(){
    assert.notEqual(retriever, undefined);
  });
});
