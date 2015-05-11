(function() {
  "use strict";

  var starter = (function() {
    return {
      start: function(localScheduleLoader, scheduleHandler, contentViewCreator) {
        return localScheduleLoader.loadSchedule().then(function(scheduleData) {
          scheduleHandler.setScheduleData(scheduleData);
          scheduleHandler.cycleViews
          (contentViewCreator.createContentViews(scheduleData.items));
        });
      }
    };
  }());

  if (typeof window === "undefined") {
    module.exports = starter;
  } else {
    starter.start($rv.localScheduleLoader, $rv.scheduleHandler, $rv.contentViewCreator);
  }
}());
