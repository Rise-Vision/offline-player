"use strict";

$rv.localScheduleLoader.loadSchedule().then(function(scheduleData) {
  $rv.schedule.scheduleData = scheduleData;
  $rv.schedule.createItemWebviews();
  $rv.schedule.cycleItems();
});
