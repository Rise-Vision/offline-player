"use strict";
var domPlatformController = require("../../app/player/platform/ui-controller.js"),
assert = require("assert");

global.logger = {external: function(){}, console: function(){}};

describe("platform ui controller", function() {
  beforeEach("clear views", function() {
    var views = document.querySelectorAll("webview");
    Array.prototype.forEach.call(views, function(view) {
      document.body.removeChild(view);
    });
  });

  it("creates and removes view windows from source content", function(done) {
    domPlatformController.createViewWindow("TESTCONTENT").then(function(view) {
      assert.ok(document.querySelector("webview"));
      assert.equal(document.querySelector("webview").src, "TESTCONTENT");
      domPlatformController.removeView(view);
      assert.equal(document.querySelectorAll("webview").length, 0);
      done();
    });
  });

  it("sets correct partition with local source pages", function(done) {
    domPlatformController.createViewWindow("../test").then(function(view) {
      assert.ok(document.querySelector("webview"));
      assert.equal(document.querySelector("webview").partition, "persist:packaged");
      done();
    });
  });

  it("can change view window visibility", function(done) {
    domPlatformController.createViewWindow("TESTCONTENT").then(function(view) {
      domPlatformController.setVisibility(view, false);
      assert.equal(document.querySelector("webview").style.display, "none");
      domPlatformController.setVisibility(view, true);
      assert.equal(document.querySelector("webview").style.display, "block");
      done();
    });
  });
});
