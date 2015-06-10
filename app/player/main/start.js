(function() {
  "use strict";
  var platformIOFunctions = require("../platform/io-provider.js"),
  contentViewController = require("../schedule/content-view-controller.js")
  (require("../platform/ui-controller.js")),

  localScheduleLoader = require("../schedule/local-schedule-loader.js"),

  timelineParser = require("../schedule/timeline-parser.js")(),

  coreUrls = require("../options/core-urls.js")(navigator.platform.replace(" ", "/")),
  remoteScheduleLoader = require("../schedule/remote-schedule-retriever.js")
  (platformIOFunctions, coreUrls);

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
