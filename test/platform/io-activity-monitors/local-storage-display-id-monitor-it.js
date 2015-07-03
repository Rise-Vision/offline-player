"use strict";
var assert = require("assert"),
platformIO = require("../../../app/player/platform/io-provider.js"),
segmentLogger = require("../../../app/player/logging/external-logger-segment.js")
(platformIO),
remoteScheduleLoader = require("../../../app/player/schedule/remote-schedule-retriever.js")(platformIO, {}),
displayIdMonitor = require("../../../app/player/platform/io-activity-monitors/local-storage-display-id-monitor.js")(remoteScheduleLoader, segmentLogger);

describe("local storage display id monitor", function() {
  it("updates segment logger display id when id is changed", function() {
    var data;
    chrome.storage.local.set({displayId: "Test123"});
    setTimeout(function() {
      data = segmentLogger.sendEvent("Test");
      assert.equal(data.userId, "Test123");
    }, 200);
  });
});
