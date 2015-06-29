"use strict";

var assert = require("assert"),
mock = require("simple-mock").mock,
contentViewControllerPath = "../../app/player/schedule/content-view-controller.js",
uiController = {},
htmlParser = {},
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
    mock(uiController, "createViewWindow").returnWith(true);
    mock(uiController, "setVisibility").returnWith(true);
    mock(uiController, "removeView").returnWith(true);
    contentViewController = require(contentViewControllerPath)(uiController, htmlParser);
  });

  it("exists", function(){
    assert.notEqual(contentViewController, undefined);
  });

  it("creates views with cached source", function() {
    return contentViewController.createContentViews(scheduleItems)
    .then(function(contentViews) {
      var calls = uiController.createViewWindow.calls;

      assert.equal(Object.keys(contentViews).length, 2);
      assert.deepEqual(calls[0].args, ["url-to-parsed-html"]);
      assert.deepEqual(calls[1].args, ["someOtherUrl"]);
    });
  });

  it("doesn't alter local urls", function() {
    scheduleItems[0].objectReference = "../";
    return contentViewController.createContentViews(scheduleItems)
    .then(function(contentViews) {
      var calls = uiController.createViewWindow.calls;

      assert.ok(contentViews["../"]);
      assert.deepEqual(calls[0].args, ["../"]);
    });
  });

  it("shows views", function() {
    return contentViewController.createContentViews(scheduleItems)
    .then(function(contentViews) {
      contentViewController.showView(riseUrl);
      assert.deepEqual(uiController.setVisibility.calls[0].args, [true, true]);
    });
  });

  it("hides views", function() {
    return contentViewController.createContentViews(scheduleItems)
    .then(function(contentViews) {
      contentViewController.hideView("someOtherUrl");
      assert.deepEqual(uiController.setVisibility.calls[0].args, [true, false]);
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
