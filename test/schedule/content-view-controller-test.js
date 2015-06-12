"use strict";

var assert = require("assert"),
contentViewControllerPath = "../../app/player/schedule/content-view-controller.js",
platformUIMock = require("../platform/mock-ui-controller.js"),
contentViewController = require(contentViewControllerPath)(platformUIMock);

describe("content view controller", function(){
  var scheduleItems = [{type: "url"}, {type: "url"}];

  it("exists", function(){
    assert.notEqual(contentViewController, undefined);
  });

  it("creates views", function() {
    var contentViews = contentViewController.createContentViews(scheduleItems);

    assert.equal(contentViews.length, 2);
  });

  it("shows views", function() {
    var contentViews = contentViewController.createContentViews(scheduleItems);

    contentViewController.showView(0);
    assert.equal(contentViews[0].visibility, true);
  });

  it("hides views", function() {
    var contentViews = contentViewController.createContentViews(scheduleItems);

    contentViewController.hideView(0);
    assert.equal(contentViews[0].visibility, false);
  });

  it("removes views", function() {
    var contentViews = contentViewController.createContentViews(scheduleItems),
    newViews;

    assert.equal(contentViews.length, 2);
    newViews = contentViewController.createContentViews([]);
    assert.deepEqual(newViews, []);
  });
});
