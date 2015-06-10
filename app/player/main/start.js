(function() {
  "use strict";
  var contentViewController = require("../schedule/content-view-controller.js")
  (require("../platform/dom-platform-ui-controller.js")),

  localScheduleLoader = require("../schedule/local-schedule-loader.js"),

  timelineParser = require("../schedule/timeline-parser.js")(),

  remoteScheduleLoader = require("../schedule/remote-schedule-retriever.js"),

  scheduleHandler = require("../schedule/schedule-handler.js")
  (contentViewController);

  require("../alarms/remote-schedule-fetch.js")(remoteScheduleLoader);
  require("../storageMonitors/local-schedule-monitor.js")(reloadLocalSchedule);
  require("../storageMonitors/display-id-monitor.js")(remoteScheduleLoader);

  remoteScheduleLoader();
  reloadLocalSchedule();

  function reloadLocalSchedule() {
    localScheduleLoader(timelineParser)
    .then(function(scheduleData) {
      scheduleHandler.setScheduleData(scheduleData);

      scheduleHandler.cycleViews
      (contentViewController.createContentViews(scheduleData.items));
    });
  }
}());
