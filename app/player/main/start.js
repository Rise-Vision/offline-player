module.exports = function(serviceUrls) {
  "use strict";
  var platformIOProvider = require("../platform/io-provider.js"),

  platformUIController = require("../platform/ui-controller.js"),

  remoteFolderFetcher = require("../cache/remote-folder-fetcher.js")
  (platformIOProvider, serviceUrls),

  contentViewController = require("../schedule/content-view-controller.js")
  (platformUIController, platformIOProvider),

  localScheduleLoader = require("../schedule/local-schedule-loader.js"),

  timelineParser = require("../schedule/timeline-parser.js")(),

  contentCycler = require("../schedule/content-cycler.js")
  (contentViewController),  

  remoteScheduleLoader= require("../schedule/remote-schedule-retriever.js")
  (platformIOProvider, serviceUrls),
  
  segmentLogger = require("../logging/external-logger-segment.js")
  (platformIOProvider, serviceUrls);

  global.logger = require("../logging/logger.js")(segmentLogger);

  (function loadIntraViewListeners() {
    var dispatcher = require("../platform/content-event-handlers/intra-view-event-dispatcher.js")(contentViewController, platformUIController);

    dispatcher.addContentEventHandler(require("../platform/content-event-handlers/bypass-cors.js")());
    dispatcher.addContentEventHandler(require("../platform/content-event-handlers/storage-component-load.js")(platformIO, uiController));
    dispatcher.addContentEventHandler(require("../platform/content-event-handlers/storage-component-response.js")(serviceUrls, platformIO, remoteFolderFetcher, uiController));
  }());

  (function loadRemoteStorageListener() {
    var remoteStorageListener = require("../platform/remote-storage-listener.js")(platformIOProvider, contentViewController, platformUIController, remoteFolderFetcher);
    platformIOProvider.registerExternalStorageListener(remoteStorageListener);
  }());

  (function loadTimedIntervalTasks() {
    require("../alarms/remote-schedule-fetch.js")(remoteScheduleLoader);
  }());

  (function loadIOActivityMonitors() {
    require("../platform/io-activity-monitors/local-storage-display-id-monitor.js")(remoteScheduleLoader, segmentLogger);
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
    })
    .then(function() {
      var risePresentations = localSchedule.items.map(function(scheduleItem) {
        var url = scheduleItem.objectReference;
        return url.substr(0, url.lastIndexOf("/") + 1);
      }).filter(function(url) {
        return /risemedialibrary-.{36}\//.test(url);
      });

      platformIOProvider.registerTargets(serviceUrls.registerTargetUrl, risePresentations, true);

      return true;
    });
  }
};
