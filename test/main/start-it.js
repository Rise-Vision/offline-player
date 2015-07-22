"use strict";
var assert = require("assert"),
start = require("../../app/player/main/start.js"),
serviceUrls = require("./mock-service-urls.js");

describe("starter", function() {
  it("exists", function() {
    assert.ok(start);
  });

  it("starts", function() {
    return start(serviceUrls, {
      updateDisplayId: function(){},
      sendEvent: function(){}
    })
    .then(function(resp) {
      assert.equal(resp, true);
    });
  });
  
  it("has a logger", function() {
    assert.ok(logger);
  });

  it("shows empty schedule", function() {
    var webviewSource = document.body.querySelectorAll("webview")[0].src;
    assert.ok(webviewSource.indexOf("empty-schedule") > -1);
  });

  it("updates webviews on display id change", function() {
    return new Promise(function(resolve, reject) {
      chrome.storage.local.set({displayId: "9XJUA6ESG8Y3"}, function() {
        var intervalHandle = setInterval(function() {
          var webviews = document.body.querySelectorAll("webview");
          if (webviews[0] && webviews[0].src.indexOf("mock-remote-page") > -1) {
            clearInterval(intervalHandle);
            resolve();
          }
        }, 100);
      });
    });
  });
});
