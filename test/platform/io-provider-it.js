var assert = require("assert"),
platformIO = require("../../app/player/platform/io-provider.js");

describe("io provider platform functions", function() {
  it("exists", function() {
    assert.ok(platformIO, "existence");
  });
});
