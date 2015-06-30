module.exports = function(serviceUrls) {
  "use strict";
  var deps = {};

  var platformIOProvider = require("../platform/io-provider.js")(serviceUrls),

  platformUIController = require("../platform/ui-controller.js"),

  htmlParser = require("../cache/html-parser.js")(platformIOProvider),

  remoteFolderFetcher = require("../cache/remote-folder-fetcher.js")
  (platformIOProvider, htmlParser),

  contentViewController = require("../schedule/content-view-controller.js")
  (platformUIController, platformIOProvider, htmlParser, remoteFolderFetcher),

  localScheduleLoader = require("../schedule/local-schedule-loader.js"),

  timelineParser = require("../schedule/timeline-parser.js")(),

  contentCycler = require("../schedule/content-cycler.js")
  (contentViewController),  

  remoteScheduleLoader = require("../schedule/remote-schedule-retriever.js")
  (platformIOProvider, serviceUrls),

  clientEventsListener = require("../main/client-events-listener.js")(deps);

  // Dependencies provided in a single object
  deps.platformIOProvider = platformIOProvider;
  deps.platformUIController = platformUIController;
  deps.htmlParser = htmlParser;
  deps.remoteFolderFetcher = remoteFolderFetcher;
  deps.contentViewController = contentViewController;
  deps.localScheduleLoader = localScheduleLoader;
  deps.timelineParser = timelineParser;
  deps.contentCycler = contentCycler;
  deps.remoteScheduleLoader = remoteScheduleLoader;
  
  (function loadTimedIntervalTasks() {
    require("../alarms/remote-schedule-fetch.js")(remoteScheduleLoader);
  }());

  (function loadIOActivityMonitors() {
    require("../platform/io-activity-monitors/local-storage-display-id-monitor.js")(remoteScheduleLoader);
    require("../platform/io-activity-monitors/local-storage-schedule-monitor.js")(resetContent);
  }());

  return remoteScheduleLoader.loadRemoteSchedule()
  .catch(function(err) {
    console.log("Remote schedule loader: " + err);
  })
  .then(resetContent);

  function resetContent() {
    var localSchedule;

    return localScheduleLoader(timelineParser)
    .then(function(resp) {
      localSchedule = resp;
      return remoteFolderFetcher.fetchFoldersIntoFilesystem(resp.items);
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
