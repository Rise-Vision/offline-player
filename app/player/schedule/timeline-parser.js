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
      if (!timelineObject) {err("no timeline");}
      timeline = timelineObject;

      compareDate = compareTo ? getDateComponent(compareTo) : getDateComponent(new Date());
      compareTime = getTimeComponent(compareTo);

      startTime = timeline.startTime ? getTimeComponent(timeline.startTime) : 0;
      endTime = timeline.endTime ? getTimeComponent(timeline.endTime) : 0;

      startDate = getDateComponent(timelineObject.startDate);
      endDate = getDateComponent(timelineObject.endDate);

      recurrenceFrequency = timeline.recurrenceFrequency;
      if (recurrenceFrequency < 1) {recurrenceFrequency = 1;}

      checkStartEndDateRange();
      checkStartEndTimeRange();
      checkRecurrence[timeline.recurrenceType]();

      return true;
    }
  };

  function err(msg) {throw new Error(msg); }

  function checkStartEndDateRange() {
    if (!timeline.hasOwnProperty("timeDefined")) {err("time defined"); }
    if (timeline.timeDefined === false) {err("time defined false"); }
    if (!timeline.hasOwnProperty("startDate")) {err("start date"); }

    if (startDate > compareDate) {err("before start"); }
    if (endDate < compareDate) {err("after end"); }
  }

  function checkStartEndTimeRange() {
    if (startTime === 0 && endTime === 0) {return true;}

    if (playsOvernight()) {
      if (compareTime < startTime && compareTime > endTime) {
        err("play at night");
      }
    } else {
      if (compareTime < startTime || compareTime > endTime) {
        err("play during day");
      }
    }
  }

  function checkDailyRecurrence() {
    if (timeline.recurrenceType != "Daily") {return true;}
    if (daysPassed() % recurrenceFrequency !== 0) {err("wrong day frequency");}
  }

  function checkWeeklyRecurrence() {
    if (timeline.recurrenceType != "Weekly") { return true; }
    if (weeksPassed() % recurrenceFrequency !==0) {err("wrong weekly frequency");}
    if (!playsThisWeekday()) {err("wrong weekday");}
  }

  function checkMonthlyRecurrence() {
    if (timeline.recurrenceType != "Monthly") { return true; }
    if (monthsPassed() % recurrenceFrequency !==0) {err("wrong monthly frequency") ;}

    if (timeline.recurrenceAbsolute) {
      if (timeline.recurrenceDayOfMonth !== compareDate.getDate()) {err("wrong day of month");}
    } else {
      if (timeline.recurrenceDayOfWeek !== compareDate.getDay()) {err("wrong day of week");}
      if (timeline.recurrenceWeekOfMonth === 4) {
        if (compareDate.getDate() <= (daysInMonth(compareDate) - 7)) {err("not last week of month");}
      } else {
        if ((timeline.recurrenceWeekOfMonth !== (parseInt((compareDate.getDate() - 1) / 7, 10)))) {err("wrong week of month");}
      }
    }
  }

  function checkYearlyRecurrence() {
    if (timeline.recurrenceType != "Yearly") { return true; }
    if (timeline.recurrenceMonthOfYear !== compareDate.getMonth()) {err("wrong month of year");}

    if (timeline.recurrenceAbsolute) {
      if (timeline.recurrenceDayOfMonth !== compareDate.getDate()) {err("wrong day of month");}
    } else {
      if (compareDate.getDay() !== timeline.recurrenceDayOfWeek) {err("wrong day of week");}
      if (compareDate.getDate() < (timeline.recurrenceWeekOfMonth * 7) || compareDate.getDate() > timeline.recurrenceWeekOfMonth * 7 + 7) {err("wrong week of month");}
    }
  }

  function daysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  function monthsPassed() {
    return ((compareDate.getFullYear() - startDate.getFullYear()) * 12) +
    compareDate.getMonth() - startDate.getMonth();
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
