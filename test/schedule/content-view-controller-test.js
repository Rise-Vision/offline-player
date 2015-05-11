"use strict";

var assert = require("assert"),
contentViewCreatorFactory = require("../../app/player/schedule/content-view-controller.js");

describe("content view creator", function(){
  it("exists", function(){
    assert.notEqual(contentViewCreatorFactory(), undefined);
  });

  it("creates and removes views from schedule items", function() {
    var items = [{type: "url"}, {type: "url"}, {type: "presentation"}],
    document = {
      createElement: function() {
        return {
          style: {height: 0, width: 0, display: ""}
        };
      },
      body: {
        appendChild: function() {},
        clientWidth: 0,
        clientHeight: 0,
        removeChild: function() {}
      }
    },
    contentViewCreator;

    contentViewCreator = contentViewCreatorFactory(document);
    assert.equal(contentViewCreator.createContentViews(items).length, 2);
    assert.equal(contentViewCreator.removeContentViews(), true);
  });
});
