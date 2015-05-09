"use strict";

$rv.localScheduleLoader.loadSchedule().then(function() {
  $rv.schedule.createItemWebviews();
  $rv.schedule.cycleItems();
});
