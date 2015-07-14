"use strict";
var assert = require("assert"),
platformIO = require("../../../app/player/platform/io-provider.js"),
serviceUrls = require("../../main/mock-service-urls.js"),
segmentLogger = require("../../../app/player/logging/external-logger-segment.js")
(platformIO, {}, serviceUrls),
remoteScheduleLoader = require("../../../app/player/schedule/remote-schedule-retriever.js")(platformIO, serviceUrls),
displayIdMonitor = require("../../../app/player/platform/io-activity-monitors/local-storage-display-id-monitor.js")(remoteScheduleLoader, segmentLogger);

describe("local storage display id monitor", function() {
  it("updates segment logger display id when id is changed", function() {
    var data;
    chrome.storage.local.set({displayId: "Test123"});
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        segmentLogger.sendEvent("Test")
        .then(function(resp) {
          return resp.json();
        })
        .then(function(json) {
          resolve(json.userId);
        });
      }, 200);
    })
    .then(function(id) {
      assert.equal(id, "Test123");
    });
  });
});
