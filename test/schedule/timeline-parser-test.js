"use strict";
var assert = require("assert"),
parser = require("../../app/player/schedule/timeline-parser.js");

describe("timeline parser", function() {
  it("exists", function() {
    assert.notEqual(parser, undefined);
  });

  it("refuses play on empty schedule", function() {
    assert.equal(parser.canPlay(), false);
  });

  it("refuses play if time defined as false", function() {
    assert.equal(parser.canPlay({timeDefined: false}), false);
  });

  it("refuses play if no start date", function() {
    assert.equal(parser.canPlay({timeDefined: true}), false);
  });

  it("refuses play if start date is in the future", function() {
    assert.equal(parser.canPlay({
      timeDefined: true,
      startDate: "12/31/2099"
    }), false);
  });

  it("refuses play if end date has passed", function() {
    assert.equal(parser.canPlay({
      timeDefined: true,
      startDate: "12/31/2000",
      endDate: "12/31/2002"
    }), false);
  });

  it("refuses play if not within overnight play time", function() {
    assert.equal(parser.canPlay({
      timeDefined: true,
      startDate: "12/31/2000",
      endDate: "12/31/2022",
      startTime: "01/01/01 9:55 PM",
      endTime: "01/01/01 10:55 AM"
    }, new Date("1/1/2020 9:52 PM")), false);
  });

  it("refuses play if before daytime play time", function() {
    assert.equal(parser.canPlay({
      timeDefined: true,
      startDate: "12/31/2000",
      endDate: "12/31/2022",
      startTime: "01/01/01 9:55 AM",
      endTime: "01/01/01 10:55 AM"
    }, new Date("1/1/2020 9:52 AM")), false);
  });

  it("refuses play if after daytime play time", function() {
    assert.equal(parser.canPlay({
      timeDefined: true,
      startDate: "12/31/2000",
      endDate: "12/31/2022",
      startTime: "01/01/01 9:55 AM",
      endTime: "01/01/01 10:55 AM"
    }, new Date("1/1/2020 10:56 AM")), false);
  });
  
  it("refuses play if daily recurrence is not met", function() {
    assert.equal(parser.canPlay({
      timeDefined: true,
      startDate: "01/01/2001",
      endDate: "12/31/2022",
      startTime: "01/01/01 9:55 AM",
      endTime: "01/01/01 10:55 AM",
      recurrenceType: "Daily",
      recurrenceFrequency: 3
    }, new Date("01/03/2001 10:52 AM")), false);
  });

  it("refuses play if weekly recurrence is not met", function() {
    assert.equal(parser.canPlay({
      timeDefined: true,
      startDate: "01/01/2001",
      endDate: "12/31/2022",
      startTime: "01/01/01 9:55 AM",
      endTime: "01/01/01 10:55 AM",
      recurrenceType: "Weekly",
      recurrenceFrequency: 3
    }, new Date("01/18/2001 10:52 AM")), false);
  });

  it("refuses play if weekly recurrence is met on wrong day",  function() {
    assert.equal(parser.canPlay({
      timeDefined: true,
      startDate: "01/01/2001",
      endDate: "12/31/2022",
      startTime: "01/01/01 9:55 AM",
      endTime: "01/01/01 10:55 AM",
      recurrenceType: "Weekly",
      recurrenceFrequency: 3,
      recurrenceDaysOfWeek: ["Sun", "Mon"]
    }, new Date("01/02/2001 10:52 AM")), false);
  });

  it("refuses play if absolute monthly recurrence is not met",  function() {
    assert.equal(parser.canPlay({
      timeDefined: true,
      startDate: "01/01/2001",
      endDate: "12/31/2022",
      startTime: "01/01/01 9:55 AM",
      endTime: "01/01/01 10:55 AM",
      recurrenceType: "Monthly",
      recurrenceAbsolute: true,
      recurrenceFrequency: 3,
      recurrenceDayOfMonth: 2
    }, new Date("05/02/2001 10:52 AM")), false);
  });

  it("refuses play if absolute monthly recurrence is not met on correct day of month",  function() {
    assert.equal(parser.canPlay({
      timeDefined: true,
      startDate: "01/01/2001",
      endDate: "12/31/2022",
      startTime: "01/01/01 9:55 AM",
      endTime: "01/01/01 10:55 AM",
      recurrenceType: "Monthly",
      recurrenceAbsolute: true,
      recurrenceFrequency: 3,
      recurrenceDayOfMonth: 3
    }, new Date("04/02/2001 10:52 AM")), false);
  });

  it("refuses play if monthly recurrence is wrong day of week",  function() {
    assert.equal(parser.canPlay({
      timeDefined: true,
      startDate: "01/01/2001",
      endDate: "12/31/2022",
      startTime: "01/01/01 9:55 AM",
      endTime: "01/01/01 10:55 AM",
      recurrenceType: "Monthly",
      recurrenceAbsolute: false,
      recurrenceFrequency: 3,
      recurrenceDayOfWeek: 0,
      recurrenceDayOfMonth: 3
    }, new Date("04/02/2001 10:52 AM")), false);
  });

  it("refuses play if monthly recurrence is last week of month and compare date is not in last week",  function() {
    assert.equal(parser.canPlay({
      timeDefined: true,
      startDate: "05/28/2015",
      endDate: "12/31/2022",
      startTime: "01/01/01 9:55 AM",
      endTime: "01/01/01 10:55 AM",
      recurrenceType: "Monthly",
      recurrenceAbsolute: false,
      recurrenceFrequency: 1,
      recurrenceDayOfWeek: 1,
      recurrenceWeekOfMonth: 4
    }, new Date("04/29/2015 10:52 AM")), false);
  });

  it("refuses play if monthly recurrence is not last week of month and compare date is in wrong week",  function() {
    assert.equal(parser.canPlay({
      timeDefined: true,
      startDate: "05/12/2015",
      endDate: "12/31/2022",
      startTime: "01/01/01 9:55 AM",
      endTime: "01/01/01 10:55 AM",
      recurrenceType: "Monthly",
      recurrenceAbsolute: false,
      recurrenceFrequency: 1,
      recurrenceDayOfWeek: 3,
      recurrenceWeekOfMonth: 3
    }, new Date("05/20/2015 10:52 AM")), false);
  });

  it("allows play if monthly recurrence is not last week of month and compare date is in correct week",  function() {
    assert.equal(parser.canPlay({
      timeDefined: true,
      startDate: "05/12/2015",
      endDate: "12/31/2022",
      startTime: "01/01/01 9:55 AM",
      endTime: "01/01/01 10:55 AM",
      recurrenceType: "Monthly",
      recurrenceAbsolute: false,
      recurrenceFrequency: 1,
      recurrenceDayOfWeek: 5,
      recurrenceWeekOfMonth: 3
    }, new Date("05/22/2015 10:52 AM")), true);
  });
  
  it("allows play if absolute yearly recurrence day is met", function() {
    assert.equal(parser.canPlay({
      timeDefined: true,
      startDate: "05/12/2015",
      endDate: "12/31/2022",
      startTime: "01/01/01 9:55 AM",
      endTime: "01/01/01 10:55 AM",
      recurrenceType: "Yearly",
      recurrenceAbsolute: true,
      recurrenceDayOfMonth: 22,
      recurrenceMonthOfYear: 4
    }, new Date("05/22/2015 10:52 AM")), true);
  });

  it("refuses play if absolute yearly recurrence month is not met", function() {
    assert.equal(parser.canPlay({
      timeDefined: true,
      startDate: "05/12/2015",
      endDate: "12/31/2022",
      startTime: "01/01/01 9:55 AM",
      endTime: "01/01/01 10:55 AM",
      recurrenceType: "Yearly",
      recurrenceAbsolute: true,
      recurrenceDayOfMonth: 22,
      recurrenceMonthOfYear: 3
    }, new Date("05/22/2015 10:52 AM")), false);
  });

  it("allows play if absolute yearly recurrence month is met", function() {
    assert.equal(parser.canPlay({
      timeDefined: true,
      startDate: "05/12/2015",
      endDate: "12/31/2022",
      startTime: "01/01/01 9:55 AM",
      endTime: "01/01/01 10:55 AM",
      recurrenceType: "Yearly",
      recurrenceAbsolute: true,
      recurrenceDayOfMonth: 22,
      recurrenceMonthOfYear: 4
    }, new Date("05/22/2015 10:52 AM")), true);
  });

  it("refuses play if yearly recurrence day of week is not met", function() {
    assert.equal(parser.canPlay({
      timeDefined: true,
      startDate: "05/12/2015",
      endDate: "12/31/2022",
      startTime: "01/01/01 9:55 AM",
      endTime: "01/01/01 10:55 AM",
      recurrenceType: "Yearly",
      recurrenceAbsolute: false,
      recurrenceDayOfMonth: 22,
      recurrenceMonthOfYear: 4,
      recurrenceDayOfWeek: 4
    }, new Date("05/22/2015 10:52 AM")), false);
  });

  it("refuses play if yearly recurrence month of year is not met", function() {
    assert.equal(parser.canPlay({
      timeDefined: true,
      startDate: "05/12/2015",
      endDate: "12/31/2022",
      startTime: "01/01/01 9:55 AM",
      endTime: "01/01/01 10:55 AM",
      recurrenceType: "Yearly",
      recurrenceAbsolute: false,
      recurrenceDayOfMonth: 22,
      recurrenceMonthOfYear: 3,
      recurrenceDayOfWeek: 5
    }, new Date("05/22/2015 10:52 AM")), false);
  });

  it("refuses play if yearly recurrence week number is not met", function() {
    assert.equal(parser.canPlay({
      timeDefined: true,
      startDate: "05/12/2015",
      endDate: "12/31/2022",
      startTime: "01/01/01 9:55 AM",
      endTime: "01/01/01 10:55 AM",
      recurrenceType: "Yearly",
      recurrenceAbsolute: false,
      recurrenceDayOfMonth: 22,
      recurrenceMonthOfYear: 4,
      recurrenceDayOfWeek: 5,
      recurrenceWeekOfMonth: 4
    }, new Date("05/22/2015 10:52 AM")), false);
  });
});
