"use strict";
var domPlatformController = require("../../app/player/platform/ui-controller.js"),
assert = require("assert");

describe("platform ui controller", function() {
  it("creates and removes view windows from source content", function() {
    var view = domPlatformController.createViewWindow("TESTCONTENT");
    assert.ok(document.querySelector("webview"));
    assert.equal(document.querySelector("webview").src, "TESTCONTENT");
    domPlatformController.removeView(view);
    assert.equal(document.querySelectorAll("webview").length, 0);
  });


  it("can change view window visibility", function() {
    var view = domPlatformController.createViewWindow("TESTCONTENT");
    domPlatformController.setVisibility(view, false);
    assert.equal(document.querySelector("webview").style.display, "none");
    domPlatformController.setVisibility(view, true);
    assert.equal(document.querySelector("webview").style.display, "block");
  });
});
