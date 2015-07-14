module.exports = function(serviceUrls) {
  "use strict";
  var platformIOProvider = require("../platform/io-provider.js"),

  platformInfo = require("../platform/version-info.js"),

  platformFS = require("../platform/filesystem/fs-provider.js"),

  platformRS = require("../platform/remote-storage/rs-provider.js")
  (platformIOProvider, serviceUrls),

  platformUIController = require("../platform/ui-controller.js"),

  remoteFolderFetcher = require("../cache/remote-folder-fetcher.js")
  (platformFS, platformIOProvider),

  contentViewController = require("../schedule/content-view-controller.js")
  (platformUIController, platformIOProvider, platformFS),

  localScheduleLoader = require("../schedule/local-schedule-loader.js"),

  timelineParser = require("../schedule/timeline-parser.js")(),

  contentCycler = require("../schedule/content-cycler.js")
  (contentViewController),  

  remoteScheduleLoader= require("../schedule/remote-schedule-retriever.js")
  (platformIOProvider, serviceUrls),
  
  segmentLogger = require("../logging/external-logger-segment.js")
  (platformIOProvider, platformInfo, serviceUrls);

  global.logger = require("../logging/logger.js")(segmentLogger);
  logger.external("Startup");

  (function loadIntraViewListeners() {
    var dispatcher = require("../platform/content-event-handlers/intra-view-event-dispatcher.js")(contentViewController, platformUIController);

    dispatcher.addEventHandler(require("../platform/content-event-handlers/bypass-cors.js")());
    dispatcher.addEventHandler(require("../platform/content-event-handlers/storage-component-load.js")(platformIOProvider, platformUIController));
    dispatcher.addEventHandler(require("../platform/content-event-handlers/storage-component-response.js")(platformIOProvider, platformRS, remoteFolderFetcher, platformUIController));
  }());

  (function loadRemoteStorageListener() {
    var remoteStorageListener = require("../remote-storage/remote-storage-listener.js")(platformIOProvider, platformFS, contentViewController, platformUIController, remoteFolderFetcher);
    platformRS.registerRemoteStorageListener(remoteStorageListener);
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
      platformRS.registerTargets(localSchedule.items, true);
      return true;
    });
  }
};
