"use strict";

$rv.localScheduleLoader.loadSchedule().then(function(scheduleData) {
  $rv.scheduleHandler.setScheduleData(scheduleData);
  $rv.scheduleHandler.cycleViews
  ($rv.contentViewCreator.createContentViews(scheduleData.items));
});
