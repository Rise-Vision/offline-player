"use strict";

var assert = require("assert"),
contentViewControllerPath = "../../app/player/schedule/content-view-controller.js",
platformUIMock = require("../platform/mock-ui-controller.js"),
platformIOMock = require("../platform/mock-io-provider.js")(),
contentCacheMock = require("../cache/mock-url-data-cacher.js"),

contentViewController = require(contentViewControllerPath)(platformUIMock, contentCacheMock, platformIOMock);

describe("content view controller", function(){
  var scheduleItems = [
  {type: "url", objectReference: "test1"},
  {type: "url", objectReference: "test2"}
  ];

  it("exists", function(){
    assert.notEqual(contentViewController, undefined);
  });

  it("creates views", function() {
    var contentViews = contentViewController.createContentViews(scheduleItems);

    assert.equal(Object.keys(contentViews).length, 2);
  });

  it("shows views", function() {
    var contentViews = contentViewController.createContentViews(scheduleItems);

    contentViewController.showView("test1");
    assert.equal(contentViews.test1.visibility, true);
  });

  it("hides views", function() {
    var contentViews = contentViewController.createContentViews(scheduleItems);

    contentViewController.hideView("test1");
    assert.equal(contentViews.test1.visibility, false);
  });

  it("removes views", function() {
    var contentViews = contentViewController.createContentViews(scheduleItems),
    newViews;

    assert.equal(Object.keys(contentViews).length, 2);
    newViews = contentViewController.createContentViews([]);
    assert.deepEqual(newViews, {});
  });
});
