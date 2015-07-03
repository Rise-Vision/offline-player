module.exports = function(remoteScheduleLoader, segmentLogger) {
  chrome.storage.onChanged.addListener(function(changes) {
    if (changes.hasOwnProperty("displayId")) {
      if (!changes.displayId.oldValue ||
      (changes.displayId.oldValue !== changes.displayId.newValue)) {
        segmentLogger.updateUserName(changes.displayId.newValue);
        remoteScheduleLoader.loadRemoteSchedule();
      }
    } 
  });
};
