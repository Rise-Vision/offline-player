module.exports = function(remoteScheduleLoader) {
  chrome.alarms.create("load.remote.schedule", {periodInMinutes: 1});

  chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === "load.remote.schedule") {
      console.log("loading remote schedule at " + Date.now());
      remoteScheduleLoader.loadRemoteSchedule()
    }
  });
};
