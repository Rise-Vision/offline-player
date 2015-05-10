"use strict";

$rv.localScheduleLoader.loadSchedule().then(function(scheduleData) {
  $rv.schedule.setScheduleData(scheduleData);
});
