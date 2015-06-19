"use strict";
var domPlatformController = require("../../app/player/platform/ui-controller.js"),
assert = require("assert");

describe("platform ui controller", function() {
  beforeEach("clear views", function() {
    var views = document.querySelectorAll("webview");
    Array.prototype.forEach.call(views, function(view) {
      document.body.removeChild(view);
    });
  });

  it("creates and removes view windows from source content", function() {
    var view = domPlatformController.createViewWindow("TESTCONTENT");
    assert.ok(document.querySelector("webview"));
    assert.equal(document.querySelector("webview").src, "TESTCONTENT");
    domPlatformController.removeView(view);
    assert.equal(document.querySelectorAll("webview").length, 0);
  });

  it("attaches listeners to view window", function() {
    var mockPageUrl = "http://localhost:7654/mock-remote-page",
    view = domPlatformController.createViewWindow(mockPageUrl);

    return new Promise(function(resolve, reject) {
      var listener = function(details) {
        console.log("request details: " + JSON.stringify(details));
        resolve();
        return {};
      };

      domPlatformController.attachExternalFetchListener(view, listener);
    });
  });

  it("sets correct partition with local source pages", function() {
    var view = domPlatformController.createViewWindow("../test");
    assert.ok(document.querySelector("webview"));
    assert.equal(document.querySelector("webview").partition, "persist:packaged");
  });

  it("can change view window visibility", function() {
    var view = domPlatformController.createViewWindow("TESTCONTENT");
    domPlatformController.setVisibility(view, false);
    assert.equal(document.querySelector("webview").style.display, "none");
    domPlatformController.setVisibility(view, true);
    assert.equal(document.querySelector("webview").style.display, "block");
  });
});
