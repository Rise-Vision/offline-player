module.exports = function(serviceUrls) {
  "use strict";
  var platformIOProvider = require("../platform/io-provider.js")(serviceUrls),
  platformUIController = require("../platform/ui-controller.js"),
  remoteFolderFetcher = require("../cache/remote-folder-fetcher.js"),
  externalFetchListener = require("../cache/external-fetch-listener.js")
  (remoteFolderFetcher(platformIOProvider)),
  contentCache = require("../cache/url-data-cacher.js")(platformIOProvider),
  contentViewController = require("../schedule/content-view-controller.js")
  (platformUIController, contentCache, platformIOProvider, externalFetchListener),

  localScheduleLoader = require("../schedule/local-schedule-loader.js"),

  timelineParser = require("../schedule/timeline-parser.js")(),

  contentCycler = require("../schedule/content-cycler.js")
  (contentViewController),
  
  remoteScheduleLoader;

  serviceUrls = serviceUrls || require("../options/service-urls.js")(navigator.platform.replace(" ", "/"));
  remoteScheduleLoader = require("../schedule/remote-schedule-retriever.js")
  (platformIOProvider, serviceUrls);

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
