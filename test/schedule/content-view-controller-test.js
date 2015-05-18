"use strict";

var assert = require("assert"),
platformMock = require("../platform/platform-controller-mock.js"),
contentViewController = require("../../app/player/schedule/content-view-controller.js")(platformMock);

describe("content view Controller", function(){
  var scheduleItems = [{type: "url"}, {type: "url"}, {type: "presentation"}];

  it("exists", function(){
    assert.notEqual(contentViewController, undefined);
  });

  it("creates views for url items types", function() {
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
    newViews = contentViewController.createContentViews([{type: "presentation"}]);
    assert.deepEqual(newViews, []);
  });
});
