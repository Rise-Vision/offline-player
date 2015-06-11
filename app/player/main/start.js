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

  contentCycler = require("../schedule/content-cycler.js")
  (contentViewController);

  require("../alarms/remote-schedule-fetch.js")(remoteScheduleLoader);
  require("../storageMonitors/local-schedule-monitor.js")(resetContent);
  require("../storageMonitors/display-id-monitor.js")(remoteScheduleLoader);

  remoteScheduleLoader();
  resetContent();

  function resetContent() {
    localScheduleLoader(timelineParser)
    .then(function(scheduleData) {
      contentCycler.setScheduleData(scheduleData);

      contentCycler.cycleViews
      (contentViewController.createContentViews(scheduleData.items));
    });
  }
}());
