"use strict";

var assert = require("assert"),
mock = require("simple-mock").mock,
contentViewControllerPath = "../../app/player/schedule/content-view-controller.js",
platformUIMock = require("../platform/mock-ui-controller.js"),
platformIOMock = require("../platform/mock-io-provider.js")(),
htmlParser = require("../../app/player/cache/html-parser.js")(),
scheduleItems, 
riseUrl = "risemedialibrary-323232323232323232323232323232323232/1/tst.html",
contentViewController;


describe("content view controller", function(){
  beforeEach("set schedule", function() {
    scheduleItems = [
      {type: "url", objectReference: riseUrl},
      {type: "url", objectReference: "someOtherUrl"}
    ];
  });

  beforeEach("inject mocks", function() {
    mock(htmlParser, "parseSavedHtmlFile").returnWith("url-to-parsed-html");
    contentViewController = require(contentViewControllerPath)(platformUIMock, platformIOMock, htmlParser);
  });

  it("exists", function(){
    assert.notEqual(contentViewController, undefined);
  });

  it("creates views with cached source", function() {
    return contentViewController.createContentViews(scheduleItems)
    .then(function(contentViews) {
      assert.equal(Object.keys(contentViews).length, 2);
      assert.equal(contentViews[riseUrl].src, "url-to-parsed-html");
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
