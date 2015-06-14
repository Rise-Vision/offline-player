"use strict";
var assert = require("assert"),
start = require("../../app/player/main/start.js"),
coreUrls = require("./mock-core-urls.js");


describe("starter", function() {
  it("exists", function() {
    assert.ok(start);
  });

  it("starts", function() {
    return start(coreUrls)
    .then(function(resp) {
      assert.equal(resp, true);
    });
  });
});
