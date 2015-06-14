module.exports = function(coreUrls) {
  "use strict";
  var platformIOProvider = require("../platform/io-provider.js"),
  contentCache = require("../cache/url-data-cacher.js")(platformIOProvider),
  contentViewController = require("../schedule/content-view-controller.js")
  (require("../platform/ui-controller.js"), contentCache, platformIOProvider),

  localScheduleLoader = require("../schedule/local-schedule-loader.js"),

  timelineParser = require("../schedule/timeline-parser.js")(),

  contentCycler = require("../schedule/content-cycler.js")
  (contentViewController),
  
  remoteScheduleLoader;

  coreUrls = coreUrls || require("../options/core-urls.js")(navigator.platform.replace(" ", "/"));
  remoteScheduleLoader = require("../schedule/remote-schedule-retriever.js")
  (platformIOProvider, coreUrls);

  (function loadTimedIntervalTasks() {
    require("../alarms/remote-schedule-fetch.js")(remoteScheduleLoader);
  }());

  (function loadIOActivityMonitors() {
    require("../platform/io-activity-monitors/local-storage-display-id-monitor.js")(remoteScheduleLoader);
    require("../platform/io-activity-monitors/local-storage-schedule-monitor.js")(resetContent);
  }());

  remoteScheduleLoader.loadRemoteSchedule();
  return resetContent();

  function resetContent() {
    var localSchedule;

    return localScheduleLoader(timelineParser)
    .then(function(resp) {
      localSchedule = resp;
      contentCache.setSchedule(localSchedule);
      return contentCache.fetchUrlDataIntoFilesystem();
    })
    .then(function() {
      return contentViewController.createContentViews(localSchedule.items);
    })
    .then(function() {
      contentCycler.setScheduleData(localSchedule);
      contentCycler.cycleViews();
      return true;
    });
  }
};
