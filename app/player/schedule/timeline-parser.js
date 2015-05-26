(function() {
  "use strict";
  var startTime, compareTime, endTime, timeline, compareDate, recurrenceFrequency, recurrenceType, startDate, endDate,
  checkRecurrence = {
    "Daily": checkDailyRecurrence,
    "Weekly": checkWeeklyRecurrence,
    "Monthly": checkMonthlyRecurrence,
    "Yearly": checkYearlyRecurrence
  };


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
             checkRecurrence[timeline.recurrenceType]();
    }
  };

  function checkStartEndDateRange() {
    if (!timeline.hasOwnProperty("timeDefined")) { return false; }
    if (timeline.timeDefined === false) { return false; }
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
    if (daysPassed() % recurrenceFrequency !== 0) { return false; }
    return true;
  }

  function checkWeeklyRecurrence() {
    if (timeline.recurrenceType != "Weekly") { return true; }
    if (weeksPassed() % recurrenceFrequency !==0) { return false;}
    if (!playsThisWeekday()) {return false;}
    return true;
  }

  function checkMonthlyRecurrence() {
    if (timeline.recurrenceType != "Monthly") { return true; }
    if (monthsPassed() % recurrenceFrequency !==0) { return false;}

    if (timeline.recurrenceAbsolute) {
      if (timeline.recurrenceDayOfMonth !== compareDate.getDate()) { return false;}
    } else {
      if (timeline.recurrenceDayOfWeek !== compareDate.getDay()) {return false;}
      if (timeline.recurrenceWeekOfMonth === 4) {
        if (compareDate.getDate() <= (daysInMonth(compareDate) - 7)) { return false;}
      } else {
        if ((timeline.recurrenceWeekOfMonth !== (parseInt((compareDate.getDate() - 1) / 7, 10)))) {return false;}
      }
    }

    return true;
  }

  function daysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  function monthsPassed() {
    return ((compareDate.getFullYear() - startDate.getFullYear()) * 12) +
    compareDate.getMonth() - startDate.getMonth();
  }

  function checkYearlyRecurrence() {
    if (timeline.recurrenceType != "Monthly") { return true; }
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
    if (!timeline.recurrenceDaysOfWeek) { return false;}
    if (!Array.isArray(timeline.recurrenceDaysOfWeek)) { return false;}

    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return timeline.recurrenceDaysOfWeek.some(function(item) {
      return item === days[compareDate.getDay()];
    });
  }
}());
