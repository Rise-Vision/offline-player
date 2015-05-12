"use strict";

var assert = require("assert"),
contentViewControllerFactory = require("../../app/player/schedule/content-view-controller.js");

describe("content view Controller", function(){
  function getMocks() {
    return {
      scheduleItems: [{type: "url"}, {type: "url"}, {type: "presentation"}],

      document: {
        createElement: function() {
          return {
            style: {height: 0, width: 0, display: ""},
            requestPointerLock: function(){}
          };
        },
        body: {
          appendChild: function() {},
          clientWidth: 0,
          clientHeight: 0,
          removeChild: function() {}
        }
      }
    };
  }

  it("exists", function(){
    assert.notEqual(contentViewControllerFactory(), undefined);
  });

  it("creates views", function() {
    var contentViews,
    contentViewController;

    contentViewController = contentViewControllerFactory(getMocks().document);

    contentViews = contentViewController
    .createContentViews(getMocks().scheduleItems);

    assert.equal(contentViews.length, 2);
  });

  it("shows views", function() {
    var contentViews,
    contentViewController;

    contentViewController = contentViewControllerFactory(getMocks().document);

    contentViews = contentViewController
    .createContentViews(getMocks().scheduleItems);

    contentViewController.showView(0);
    assert.equal(contentViews[0].style.display, "block");
  });

  it("hides views", function() {
    var contentViews,
    contentViewController;

    contentViewController = contentViewControllerFactory(getMocks().document);

    contentViews = contentViewController
    .createContentViews(getMocks().scheduleItems);

    contentViewController.hideView(0);
    assert.equal(contentViews[0].style.display, "none");
  });

  it("removes views", function() {
    var contentViews,
    contentViewController;

    contentViewController = contentViewControllerFactory(getMocks().document);

    contentViews = contentViewController
    .createContentViews(getMocks().scheduleItems);

    assert.deepEqual(contentViewController.removeContentViews(), []);
  });
});
