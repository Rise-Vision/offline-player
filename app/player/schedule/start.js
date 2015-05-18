(function() {
  "use strict";
  var contentViewController = require("./content-view-controller.js")(require("../platform/dom-platform-ui-controller.js")),
  localScheduleLoader = require("./local-schedule-loader.js"),
  remoteScheduleLoad = require("./remote-schedule-retriever.js"),
  scheduleHandler = require("./schedule-handler.js")(contentViewController);

  chrome.alarms.create("load.remote.schedule", {periodInMinutes: 1});

  chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === "load.remote.schedule") {
      console.log("loading remote schedule at " + Date.now());
      remoteScheduleLoad();
    }
  });

  chrome.storage.onChanged.addListener(function(changes) {
    if (changes.hasOwnProperty("schedule")) {
      if (!changes.schedule.oldValue ||
      (changes.schedule.oldValue.changeDate !== 
      changes.schedule.newValue.changeDate)) {
        console.log("local schedule changed - reloading content");
        reloadSchedule();
      }
    }

    if (changes.hasOwnProperty("displayId")) {
      if (!changes.displayId.oldValue ||
      (changes.displayId.oldValue !== changes.displayId.newValue)) {
        remoteScheduleLoad();
      }
    } 
  });

  remoteScheduleLoad();
  reloadSchedule();

  function reloadSchedule() {
    localScheduleLoader().then(function(scheduleData) {
      scheduleHandler.setScheduleData(scheduleData);
      scheduleHandler.cycleViews
      (contentViewController.createContentViews(scheduleData.items));
    });
  }
}());
