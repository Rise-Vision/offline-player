module.exports = function(localScheduleLoader) {
  chrome.storage.onChanged.addListener(function(changes) {
    if (changes.hasOwnProperty("schedule")) {
      if (!changes.schedule.oldValue ||
      (changes.schedule.oldValue.changeDate !== 
      changes.schedule.newValue.changeDate)) {
        console.log("local schedule changed - reloading content");
        localScheduleLoader();
      }
    }
  });
};
