"use strict";
var assert = require("assert"),
parser = require("../../app/player/schedule/timeline-parser.js"),
timeline,
compareDate;

function checkPlay() {
  try {
    parser.canPlay(timeline, compareDate);
  } catch(e) {
    return e.message;
  }

  return true;
}

describe("timeline parser", function() {
  beforeEach("set up a sample timeline", function() {
    timeline = {
      timeDefined: true,
      startDate: "05/12/2015",
      endDate: "12/31/2022",
      startTime: "01/01/01 9:55 AM",
      endTime: "01/01/01 10:55 AM",
      recurrenceType: "Yearly",
      recurrenceAbsolute: false,
      recurrenceDaysOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      recurrenceDayOfMonth: 22,
      recurrenceMonthOfYear: 4,
      recurrenceDayOfWeek: 4
    };

    compareDate = new Date("05/14/2015 9:57 AM");
  });

  it("exists", function() {
    assert.notEqual(parser, undefined);
  });

  it("refuses play on empty schedule", function() {
    timeline = null;
    assert.equal(checkPlay(), "no timeline");
  });

  it("refuses play if no time defined", function() {
    delete timeline.timeDefined;
    assert.equal(checkPlay(), "time defined");
  });

  it("allows play if no time defined", function() {
    timeline.timeDefined = false;
    assert.equal(checkPlay(), true);
  });

  it("allows play if no start date", function() {
    delete timeline.startDate;
    assert.equal(checkPlay(), true);
  });

  it("forces a sane recurrenceFrequency", function() {
    timeline.recurrenceFrequency = -1;
    timeline.recurrenceType = "Daily";
    assert.equal(checkPlay(), true);
  });

  it("refuses play if start date is in the future", function() {
    timeline.startDate = "12/31/2099";
    assert.equal(checkPlay(), "before start");
  });

  it("refuses play if end date has passed", function() {
    timeline.endDate = "05/13/2015";
    assert.equal(checkPlay(), "after end");
  });

  it("refuses play if not within overnight play time", function() {
    compareDate = new Date("1/1/2020 9:52 PM");
    timeline.startTime = "01/01/01 9:55 PM";
    timeline.endTime = "01/01/01 10:55 AM";

    assert.equal(checkPlay(), "play at night");
  });

  it("refuses play if before daytime play time", function() {
    compareDate = new Date("1/1/2020 8:00 AM");
    timeline.startTime = "01/01/01 9:00 AM";
    timeline.endTime = "01/01/01 10:55 PM";

    assert.equal(checkPlay(), "play during day");
  });

  it("refuses play if after daytime play time", function() {
    compareDate = new Date("1/1/2020 11:00 PM");
    timeline.startTime = "01/01/01 9:00 AM";
    timeline.endTime = "01/01/01 10:55 PM";

    assert.equal(checkPlay(), "play during day");
  });
  
  it("refuses play if daily recurrence is not met", function() {
    timeline.recurrenceType = "Daily";
    timeline.recurrenceFrequency = 3;
    assert.equal(checkPlay(), "wrong day frequency");
  });

  it("ensures correct weekly recurrence is met", function() {
    compareDate = new Date("01/09/2001 10:55:00 AM");
    timeline.startDate = "01/01/2001";
    timeline.recurrenceType = "Weekly";

    timeline.recurrenceFrequency = 3;
    assert.equal(checkPlay(), "wrong weekly frequency");

    timeline.recurrenceFrequency = 1;
    assert.equal(checkPlay(), true);
  });

  it("ensures weekly recurrence is met on correct week day",  function() {
    compareDate = new Date("01/06/2001 10:55:00 AM");
    timeline.startDate = "01/01/2001";
    timeline.recurrenceType = "Weekly";
    timeline.recurrenceFrequency = 3;

    timeline.recurrenceDaysOfWeek = ["Sun"];
    assert.equal(checkPlay(), "wrong weekday");

    timeline.recurrenceDaysOfWeek = ["Sat", "Sun"];
    assert.equal(checkPlay(), true);
  });

  it("ensures absolute monthly recurrence frequency is met",  function() {
    timeline.recurrenceType = "Monthly";
    timeline.startDate = "01/01/2001";
    timeline.recurrenceDayOfWeek = 0;
    timeline.recurrenceWeekOfMonth = 0;
    compareDate = new Date("04/01/2001 10:55:00 AM");

    timeline.recurrenceFrequency = 3;
    assert.equal(checkPlay(), true);

    timeline.recurrenceFrequency = 2;
    assert.equal(checkPlay(), "wrong monthly frequency");
  });

  it("ensures absolute monthly recurrence is met on correct day of month",  function() {
    timeline.recurrenceType = "Monthly";
    timeline.startDate = "01/01/2001";
    timeline.recurrenceFrequency = 3;
    timeline.recurrenceAbsolute = true;
    compareDate = new Date("04/01/2001 10:55:00 AM");

    timeline.recurrenceDayOfMonth = 1;
    assert.equal(checkPlay(), true);

    timeline.recurrenceDayOfMonth = 2;
    assert.equal(checkPlay(), "wrong day of month");
  });

  it("refuses play if monthly recurrence is wrong day of week",  function() {
    timeline.recurrenceType = "Monthly";
    timeline.startDate = "01/01/2001";
    timeline.recurrenceFrequency = 3;
    timeline.recurrenceDayOfMonth = 1;
    compareDate = new Date("04/01/2001 10:55:00 AM");

    timeline.recurrenceDayOfWeek = 2;
    assert.equal(checkPlay(), "wrong day of week");
  });

  it("refuses play if monthly recurrence is last week of month and compare date is not in last week",  function() {
    timeline.recurrenceType = "Monthly";
    timeline.startDate = "04/22/2015";
    timeline.recurrenceFrequency = 1;
    timeline.recurrenceDayOfMonth = 1;
    timeline.recurrenceDayOfWeek = 3;
    timeline.recurrenceWeekOfMonth = 4;
    compareDate = new Date("04/22/2015 10:52 AM");

    assert.equal(checkPlay(), "not last week of month");
  });

  it("refuses play if monthly recurrence is not last week of month and compare date is in wrong week",  function() {
    timeline.recurrenceType = "Monthly";
    timeline.startDate = "04/22/2015";
    timeline.recurrenceFrequency = 1;
    timeline.recurrenceDayOfMonth = 1;
    timeline.recurrenceDayOfWeek = 3;
    compareDate = new Date("04/22/2015 10:52 AM");

    timeline.recurrenceWeekOfMonth = 2;
    assert.equal(checkPlay(), "wrong week of month");

    timeline.recurrenceWeekOfMonth = 3;
    assert.equal(checkPlay(), true);
  });

  it("ensures correct month of year is met", function() {
    timeline.recurrenceType = "Yearly";
    timeline.startDate = "04/22/2015";
    timeline.recurrenceDayOfWeek = 3;
    timeline.recurrenceWeekOfMonth = 3;
    compareDate = new Date("04/22/2015 10:52 AM");

    timeline.recurrenceMonthOfYear = 5;
    assert.equal(checkPlay(), "wrong month of year");

    timeline.recurrenceMonthOfYear = 3;
    assert.equal(checkPlay(), true);
  });

  it("ensures absolute yearly recurrence day is met", function() {
    timeline.recurrenceType = "Yearly";
    timeline.recurrenceAbsolute = true;
    timeline.startDate = "04/22/2015";
    timeline.recurrenceMonthOfYear = 3;
    compareDate = new Date("04/22/2015 10:52 AM");

    timeline.recurrenceDayOfMonth = 3;
    assert.equal(checkPlay(), "wrong day of month");

    timeline.recurrenceDayOfMonth = 22;
    assert.equal(checkPlay(), true);
  });

  it("ensures yearly recurrence day of week is met", function() {
    timeline.recurrenceType = "Yearly";
    timeline.startDate = "05/12/2015";
    timeline.recurrenceMonthOfYear = 3;
    timeline.recurrenceDayOfMonth = 22;
    timeline.recurrenceMonthOfYear = 4;
    compareDate = new Date("05/22/2015 10:52 AM");

    timeline.recurrenceDayOfWeek = 4;
    assert.equal(checkPlay(), "wrong day of week");

    timeline.recurrenceDayOfWeek = 5;
    assert.equal(checkPlay(), true);
  });

  it("ensures yearly recurrence week of month is met", function() {
    timeline.recurrenceType = "Yearly";
    timeline.startDate = "05/12/2015";
    timeline.recurrenceMonthOfYear = 3;
    timeline.recurrenceDayOfMonth = 22;
    timeline.recurrenceDayOfWeek = 5;
    timeline.recurrenceMonthOfYear = 4;
    compareDate = new Date("05/22/2015 10:52 AM");

    timeline.recurrenceWeekOfMonth = 2;
    assert.equal(checkPlay(), "wrong week of month");

    timeline.recurrenceWeekOfMonth = 3;
    assert.equal(checkPlay(), true);
  });
});
