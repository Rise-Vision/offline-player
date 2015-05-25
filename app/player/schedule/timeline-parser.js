(function() {
  "use strict";
  var startTime, compareTime, endTime, timeline, compareDate;

  module.exports = {
    canPlay: function(timelineObject, compareTo) {
      if (!timelineObject) { return false; }
      timeline = timelineObject;

      compareDate = compareTo || new Date();
      compareTime = getTimeComponent(compareDate);
      startTime = timeline.startTime ? getTimeComponent(timeline.startTime) : 0;
      endTime = timeline.endTime ? getTimeComponent(timeline.endTime) : 0;

      return checkStartEndDateRange() &&
             checkStartEndTimeRange();
    }
  };

  function checkStartEndDateRange() {
    if (!timeline.hasOwnProperty("timeDefined")) { return false; }
    if (timeline.timeDefined === "false") { return false; }
    if (!timeline.hasOwnProperty("startDate")) { return false; }
    if (new Date(timeline.startDate) > compareDate) { return false; }
    if (new Date(timeline.endDate) < compareDate) { return false; }
    return true;
  }

  function checkStartEndTimeRange() {
    if (startTime === 0 && endTime === 0) {return true;}

    if (playsOvernight()) {
      if (compareTime < startTime && compareTime > endTime) {
        return false;
      }
    } else {
      if (compareTime < startTime || compareTime > endTime) {
        return false;
      }
    }
  }

  function playsOvernight() {
    return startTime > endTime;
  }

  function getTimeComponent(dateText) {
    var date = new Date(dateText);
    return (date.getHours() * 60 * 60) +
           (date.getMinutes() * 60) +
           (date.getSeconds());
  }
}());
