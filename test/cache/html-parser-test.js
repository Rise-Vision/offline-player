"use strict";
var assert = require("assert"),
$ = require("cheerio"),
mock = require("simple-mock").mock,
parser;

describe("html parser", function() {
  beforeEach("setup mocks", function() {
    var platformIO = require("../../app/player/platform/io-provider.js");
    mock(platformIO, "filesystemSave").returnWith("the-url");
    mock(platformIO, "filesystemRetrieve").returnWith({url: "the-url"});
    parser = require("../../app/player/cache/html-parser.js")(platformIO);
  });

  it("exists", function() {
    assert.ok(parser);
  });

  it("loads the local file based on the url parameter", function() {

  });
});
