module.exports = function(serviceUrls, externalLogger, platformInfo) {
  "use strict";
  var platformIOProvider = require("../platform/io-provider.js"),

  platformFS = require("../platform/filesystem/fs-provider.js"),

  platformRS = require("../platform/remote-storage/rs-provider.js")
  (platformIOProvider, serviceUrls),

  platformUIController = require("../platform/ui-controller.js"),

  platformProvider = require("../platform/reboot-restart-provider.js")(platformInfo),

  cache = require("../cache/cache.js")(platformFS, platformIOProvider),

  remoteFolderFetcher = require("../cache/remote-folder-fetcher.js")
  (cache, platformIOProvider, serviceUrls),

  contentViewController = require("../schedule/content-view-controller.js")
  (platformUIController, platformIOProvider, cache),

  localScheduleLoader = require("../schedule/local-schedule-loader.js"),

  timelineParser = require("../schedule/timeline-parser.js")(),

  contentCycler = require("../schedule/content-cycler.js")
  (contentViewController),  

  remoteScheduleLoader = require("../schedule/remote-schedule-retriever.js")
  (platformIOProvider, serviceUrls),

  onlineStatusObserver = require("../alarms/online-status-observer.js")(platformIOProvider),

  tokenRetriever = require("../channel/token-retriever.js")(platformIOProvider, serviceUrls),

  messageDetailRetriever = require("../channel/message-detail-retriever.js")(platformIOProvider, serviceUrls),

  channelManager = require("../channel/channel-manager.js")(messageDetailRetriever, platformUIController),

  channelSupervisor = require("../main/channel-supervisor.js")
  (platformIOProvider, tokenRetriever, channelManager, onlineStatusObserver);
  
  global.logger = require("../logging/logger.js")(externalLogger);

  (function loadIntraViewListeners() {
    var dispatcher = require("../platform/content-event-handlers/intra-view-event-dispatcher.js")(contentViewController, platformUIController);

    dispatcher.addEventHandler(require("../platform/content-event-handlers/bypass-cors.js")());
    dispatcher.addEventHandler(require("../platform/content-event-handlers/storage-component-load.js")(platformIOProvider, platformUIController));
    dispatcher.addEventHandler(require("../platform/content-event-handlers/storage-component-response.js")(platformIOProvider, platformRS, remoteFolderFetcher, platformUIController));
  }());

  (function loadChannelEventHandlers() {
    channelManager.addEventHandler(require("../channel/handlers/reboot-handler.js")(platformProvider));
    channelManager.addEventHandler(require("../channel/handlers/restart-handler.js")(platformProvider));
    channelManager.addEventHandler(require("../channel/handlers/schedule-update-handler.js")(platformIOProvider));
  }());

  (function loadRemoteStorageListener() {
    var remoteStorageListener = require("../remote-storage/remote-storage-listener.js")(platformIOProvider, cache, contentViewController, platformUIController, remoteFolderFetcher);
    platformRS.registerRemoteStorageListener(remoteStorageListener);
  }());

  (function loadTimedIntervalTasks() {
    require("../alarms/remote-schedule-fetch.js")(remoteScheduleLoader);
  }());

  (function loadIOActivityMonitors() {
    require("../platform/io-activity-monitors/local-storage-display-id-monitor.js")(remoteScheduleLoader, externalLogger);
    require("../platform/io-activity-monitors/local-storage-schedule-monitor.js")(resetContent);
  }());

  return remoteScheduleLoader.loadRemoteSchedule()
  .then(resetContent)
  .then(function(result) {
    channelSupervisor.start();
    return result;
  });

  function resetContent() {
    var localSchedule;

    return localScheduleLoader(timelineParser, externalLogger, platformIOProvider)
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
    })
    .catch(function(err) {
      console.log("Error resetting content " + err);
    });
  }
};
