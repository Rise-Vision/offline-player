module.exports = function(remoteScheduleLoader, externalLogger) {
  chrome.storage.onChanged.addListener(function(changes) {
    if (changes.hasOwnProperty("displayId")) {
      if (!changes.displayId.oldValue ||
      (changes.displayId.oldValue !== changes.displayId.newValue)) {
        externalLogger.updateDisplayId(changes.displayId.newValue);
        remoteScheduleLoader.loadRemoteSchedule();
      }
    } 
  });
};
