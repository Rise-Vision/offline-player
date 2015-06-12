(function() {
  "use strict";
  var platformIOProvider = require("../platform/io-provider.js"),
  contentCache = require("../cache/url-data-cacher.js"),
  contentViewController = require("../schedule/content-view-controller.js")
  (require("../platform/ui-controller.js"), contentCache, platformIOProvider),

  localScheduleLoader = require("../schedule/local-schedule-loader.js"),

  timelineParser = require("../schedule/timeline-parser.js")(),

  coreUrls = require("../options/core-urls.js")(navigator.platform.replace(" ", "/")),
  remoteScheduleLoader = require("../schedule/remote-schedule-retriever.js")
  (platformIOProvider, coreUrls);

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
      contentCache.setSchedule(schedule);
      return contentCache.saveUrlDataToFilesystem();
    })
    .then(function() {
      contentViewController.createContentViews(scheduleData.items);
      contentCycler.setScheduleData(scheduleData);
      contentCycler.cycleViews();
    });
  }
}());
