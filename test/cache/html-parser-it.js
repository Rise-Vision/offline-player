"use strict";
var assert = require("assert"),
platformIO = require("../../app/player/platform/io-provider.js")({}),
parser;

parser = require("../../app/player/cache/html-parser.js")(platformIO);

describe("html parser", function() {
  it("exists", function() {
    assert.ok(parser);
  });

  it("parses", function() {
    var html = "<div><img src=\"myFolder/myImage.png\"></div>",
    fakeUrl = "http://sample-url/myHTML.html";

    return setupFilesystemAndLocalStorageScenario()
    .then(function() {
      return parser.parseSavedHtmlFile(fakeUrl);
    })
    .then(function(resp) {
      assert.equal(resp.indexOf("blob:"), 0);
      return platformIO.filesystemRetrieve("PARSED" + fakeUrl);
    })
    .then(function(resp) {
      assert.equal(resp.file, html.replace("myFolder/myImage.png", "test"));
    });

    function setupFilesystemAndLocalStorageScenario() {
      var folderItemsFromFolderRetriever = {};

      folderItemsFromFolderRetriever["http://sample-url/"] = [
        {localUrl: "test", filePath: "myFolder/myImage.png"}
      ];

      return platformIO.filesystemSave(fakeUrl, html)
      .then(function() {
        return platformIO.localObjectStore.set
        ({"folderItems": folderItemsFromFolderRetriever});
      });
    }
  });
});
