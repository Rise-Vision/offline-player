module.exports = function(resetContent) {
  chrome.storage.onChanged.addListener(function(changes) {
    if (changes.hasOwnProperty("schedule")) {
      if (isNewSchedule(changes.schedule)) {
        console.log("local schedule changed - reloading content");
        resetContent();
      }
    }
  });

  function isNewSchedule(schedule) {
    return !schedule.oldValue ||
    (schedule.oldValue.changeDate !== schedule.newValue.changeDate);
  }
};
