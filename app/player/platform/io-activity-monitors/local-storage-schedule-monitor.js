module.exports = function(resetContent) {
  chrome.storage.onChanged.addListener(function(changes) {
    if (changes.hasOwnProperty("schedule")) {
      if (isNewSchedule()) {
        console.log("local schedule changed - reloading content");
        resetContent();
      }
    }
  });

  function isNewSchedule() {
    return !changes.schedule.oldValue ||
    (changes.schedule.oldValue.changeDate !==  changes.schedule.newValue.changeDate);
  }
};
