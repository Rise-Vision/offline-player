"use strict";

var assert = require("assert"),
contentViewControllerPath = "../../app/player/schedule/content-view-controller.js",
platformUIMock = require("../platform/mock-ui-controller.js"),
platformIOMock = require("../platform/mock-io-provider.js")(),
contentCacheMock = require("../cache/mock-url-data-cacher.js"),
scheduleItems, 
riseUrl = "risemedialibrary-323232323232323232323232323232323232/1/tst.html",

contentViewController = require(contentViewControllerPath)(platformUIMock, platformIOMock);

describe("content view controller", function(){
  beforeEach("set schedule", function() {
    scheduleItems = [
      {type: "url", objectReference: riseUrl},
      {type: "url", objectReference: "someOtherUrl"}
    ];
  });

  it("exists", function(){
    assert.notEqual(contentViewController, undefined);
  });

  it("creates views with cached source", function() {
    return contentViewController.createContentViews(scheduleItems)
    .then(function(contentViews) {
      assert.equal(Object.keys(contentViews).length, 2);
      assert.equal(platformIOMock.getCalledParams().filesystemRetrieve[0],
      "253dd820037a4c80d83d233e4ac9f543ae4cb037.html");
    });
  });

  it("doesn't alter local urls", function() {
    scheduleItems[0].objectReference = "../";
    return contentViewController.createContentViews(scheduleItems)
    .then(function(contentViews) {
      assert.equal(contentViews["../"].src, "../");
    });
  });

  it("shows views", function() {
    return contentViewController.createContentViews(scheduleItems)
    .then(function(contentViews) {
      contentViewController.showView("someOtherUrl");
      assert.equal(contentViews.someOtherUrl.visibility, true);
    });
  });

  it("hides views", function() {
    return contentViewController.createContentViews(scheduleItems)
    .then(function(contentViews) {
      contentViewController.hideView("someOtherUrl");
      assert.equal(contentViews.someOtherUrl.visibility, false);
    });
  });

  it("removes views", function() {
    return contentViewController.createContentViews(scheduleItems)
    .then(function(contentViews) {
      assert.equal(Object.keys(contentViews).length, 2);
    })
    .then(function() {
      return contentViewController.createContentViews([]);
    })
    .then(function(contentViews) {
      assert.deepEqual(contentViews, {});
    });
  });
});
