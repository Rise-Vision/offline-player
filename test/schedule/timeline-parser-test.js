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
    assert.equal(parser.canPlay({timeDefined: "false"}), false);
  });

  it("refuses play if no start date", function() {
    assert.equal(parser.canPlay({timeDefined: "true"}), false);
  });

  it("refuses play if start date is in the future", function() {
    assert.equal(parser.canPlay({
      timeDefined: "true",
      startDate: "12/31/2099"
    }), false);
  });

  it("refuses play if end date has passed", function() {
    assert.equal(parser.canPlay({
      timeDefined: "true",
      startDate: "12/31/2000",
      endDate: "12/31/2002"
    }), false);
  });

  it("refuses play if not within overnight play time", function() {
    assert.equal(parser.canPlay({
      timeDefined: "true",
      startDate: "12/31/2000",
      endDate: "12/31/2022",
      startTime: "01/01/01 9:55 PM",
      endTime: "01/01/01 10:55 AM"
    }, new Date("1/1/2020 9:52 PM")), false);
  });

  it("refuses play if before daytime play time", function() {
    assert.equal(parser.canPlay({
      timeDefined: "true",
      startDate: "12/31/2000",
      endDate: "12/31/2022",
      startTime: "01/01/01 9:55 AM",
      endTime: "01/01/01 10:55 AM"
    }, new Date("1/1/2020 9:52 AM")), false);
  });

  it("refuses play if after daytime play time", function() {
    assert.equal(parser.canPlay({
      timeDefined: "true",
      startDate: "12/31/2000",
      endDate: "12/31/2022",
      startTime: "01/01/01 9:55 AM",
      endTime: "01/01/01 10:55 AM"
    }, new Date("1/1/2020 10:56 AM")), false);
  });
  
  it("refuses play if daily recurrence is not met", function() {
    assert.equal(parser.canPlay({
      timeDefined: "true",
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
      timeDefined: "true",
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
      timeDefined: "true",
      startDate: "01/01/2001",
      endDate: "12/31/2022",
      startTime: "01/01/01 9:55 AM",
      endTime: "01/01/01 10:55 AM",
      recurrenceType: "Weekly",
      recurrenceFrequency: 3,
      recurrenceDaysOfWeek: ["Sun", "Mon"]
    }, new Date("01/02/2001 10:52 AM")), false);
  });
});
