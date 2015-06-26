"use strict";
var assert = require("assert"),
mock = require("simple-mock").mock,
parser;

describe("html parser", function() {
  beforeEach("setup mocks", function() {
    var platformIO = {localObjectStore: {}};
    mock(platformIO.localObjectStore, "get").resolveWith({folderItems: {
      "http://external-url/": []
    }});
    mock(platformIO, "filesystemSave").returnWith("local-url");
    mock(platformIO, "filesystemRetrieve").resolveWith({
      url: "local-url",
      fileContentString: "<html><img src='folder/file.txt' /></html>"
    });
    
    parser = require("../../app/player/cache/html-parser.js")(platformIO);
  });

  it("exists", function() {
    assert.ok(parser);
  });

  it("returns a url to the parsed html", function() {
    return parser.parseSavedHtmlFile("http://external-url/main.html")
    .then(function(returnedUrl) {
      assert.equal(returnedUrl, "local-url");
    });
  });
});
