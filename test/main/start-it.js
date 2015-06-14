"use strict";
var assert = require("assert"),
start = require("../../app/player/main/start.js"),
coreUrls = require("./mock-core-urls.js");


describe("starter", function() {
  it("exists", function() {
    assert.ok(start);
  });

  it("starts", function() {
    return start(coreUrls)
    .then(function(resp) {
      assert.equal(resp, true);
    });
  });
  
  it("shows empty schedule", function() {
    var webviewSource = document.body.querySelectorAll("webview")[0].src;
    assert.ok(webviewSource.indexOf("empty-schedule") > -1);
  });

  it("updates on display id change", function() {
    return new Promise(function(resolve, reject) {
      chrome.storage.local.set({displayId: "9XJUA6ESG8Y3"}, function() {
        setInterval(function() {
          if (document.body.querySelectorAll("webview").length === 1) {
            resolve();
          }
        }, 300);
      });
    })
    .then(function() {
      var src = document.body.querySelectorAll("webview")[0].src;
      assert.ok(src.indexOf("blob") > -1);
    });
  });
});
