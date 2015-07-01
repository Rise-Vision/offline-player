module.exports = function(serviceUrls) {
  "use strict";
  var deps = {};

  var platformIOProvider = require("../platform/io-provider.js")(serviceUrls),

  platformUIController = require("../platform/ui-controller.js"),

  remoteFolderFetcher = require("../cache/remote-folder-fetcher.js")
  (platformIOProvider),

  contentViewController = require("../schedule/content-view-controller.js")
  (platformUIController, platformIOProvider),

  localScheduleLoader = require("../schedule/local-schedule-loader.js"),

  timelineParser = require("../schedule/timeline-parser.js")(),

  contentCycler = require("../schedule/content-cycler.js")
  (contentViewController),  

  remoteScheduleLoader = require("../schedule/remote-schedule-retriever.js")
  (platformIOProvider, serviceUrls);

  (function loadClientEventsListeners() {
    require("../main/client-events-listener.js")
    (platformIOProvider, remoteFolderFetcher);
  }());

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
