(function() {
  "use strict";
  var startTime, compareTime, endTime, timeline, compareDate, recurrenceFrequency, recurrenceType, startDate, endDate;

  module.exports = {
    canPlay: function(timelineObject, compareTo) {
      if (!timelineObject) { return false; }
      timeline = timelineObject;

      compareDate = compareTo ? getDateComponent(compareTo) : getDateComponent(new Date());
      compareTime = getTimeComponent(compareTo);

      startTime = timeline.startTime ? getTimeComponent(timeline.startTime) : 0;
      endTime = timeline.endTime ? getTimeComponent(timeline.endTime) : 0;

      startDate = getDateComponent(timelineObject.startDate);
      endDate = getDateComponent(timelineObject.endDate);

      recurrenceFrequency = timeline.recurrenceFrequency;
      if (recurrenceFrequency < 1) {recurrenceFrequency = 1;}

      recurrenceType = timelineObject.recurrenceType;

      return checkStartEndDateRange() &&
             checkStartEndTimeRange() &&
             checkDailyRecurrence() &&
             checkWeeklyRecurrence();
    }
  };

  function checkStartEndDateRange() {
    if (!timeline.hasOwnProperty("timeDefined")) { return false; }
    if (timeline.timeDefined === "false") { return false; }
    if (!timeline.hasOwnProperty("startDate")) { return false; }

    if (startDate > compareDate) { return false; }
    if (endDate < compareDate) { return false; }
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
    return true;
  }

  function checkDailyRecurrence() {
    if (recurrenceType != "Daily") {return true;}
    console.log(daysPassed());
    if (daysPassed() % recurrenceFrequency !== 0) { return false; }
    return true;
  }

  function checkWeeklyRecurrence() {
    if (weeksPassed() % recurrenceFrequency !==0) { return false;}
    if (!playsThisWeekday()) {return false;}
    return true;
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

  function getDateComponent(dateText) {
    var date = new Date(dateText);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function daysPassed() {
    return (compareDate - startDate) / (1000 * 60 * 60 * 24);
  }

  function weeksPassed() {
    return parseInt(daysPassed() / 7, 10);
  }

  function playsThisWeekday() {
    console.log("HI");
    if (!timeline.recurrenceDaysOfWeek) { return false;}
    if (!Array.isArray(timeline.recurrenceDaysOfWeek)) { return false;}

    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return timeline.recurrenceDaysOfWeek.some(function(item) {
      return item === days[compareDate.getDay()];
    });
  }
}());
