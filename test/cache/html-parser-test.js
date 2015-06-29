"use strict";
var assert = require("assert"),
mock = require("simple-mock").mock,
platformIO,
parser;

describe("html parser", function() {
  beforeEach("setup mocks", function() {
    platformIO = {localObjectStore: {}};
    mock(platformIO.localObjectStore, "get").resolveWith({folderItems: {
      "http://external-url1/": {
        "externalFile1.html": {"localUrl": "orig-local-url"},
        "externalFile2.jpg": {"localUrl": "orig-local-url"}
      },
      "http://external-url2/": {
        "externalFile3.txt": {"localUrl": "orig-local-url"},
        "myDir/externalFile4.html": {"localUrl": "orig-local-url"}
      }
    }});
    mock(platformIO, "filesystemSave").resolveWith("local-url");
    mock(platformIO, "filesystemRetrieve").resolveWith({
      url: "local-url",
      fileContentString: "<img src='externalFile4.html' />"
    });
    
    parser = require("../../app/player/cache/html-parser.js")(platformIO);
  });

  it("exists", function() {
    assert.ok(parser);
  });

  it("retrieves previously saved folder items", function() {
    return parser.parseFiles()
    .then(function() {
      assert.deepEqual
      (platformIO.localObjectStore.get.calls[0].args[0], ["folderItems"]);
    });
  });

  it("resaves a new version of all parseable files", function() {
    return parser.parseFiles()
    .then(function() {
      assert.equal(platformIO.filesystemSave.callCount, 4);
      assert(platformIO.filesystemSave.calls.some(function(call) {
        console.log(call.args[0]);
        return call.args[0] === "PARSEDhttp://external-url2/myDir/externalFile4.html"; 
      }));
    });
  });

  it("parses files", function() {
    return parser.parseFiles()
    .then(function() {
      assert.equal(platformIO.filesystemRetrieve.callCount, 2);
      assert(platformIO.filesystemSave.calls.some(function(call) {
        return /PARSED.*/.test(call.args[0]) &&
        call.args[1] === '<img src="local-url">';
      }));
    });
  });
});
