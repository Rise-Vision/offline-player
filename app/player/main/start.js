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
  require("../storageMonitors/display-id-monitor.js")(remoteScheduleLoader);
  require("../storageMonitors/local-schedule-monitor.js")(resetContent);

  remoteScheduleLoader();
  resetContent();

  function resetContent() {
    var scheduleData;

    localScheduleLoader(timelineParser)
    .then(function(scheduleData) {
      schedule = scheduleData;
      urlDataCacher.setSchedule(schedule);
      return urlDataCacher.saveUrlDataToFilesystem();
    })
    .then(function() {
      contentCycler.setScheduleData(scheduleData);
      contentCycler.cycleViews
      (contentViewController.createContentViews(scheduleData.items));
    });
  }
}());
