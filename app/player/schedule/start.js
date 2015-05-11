(function() {
  "use strict";

  var starter = (function() {
    return {
      start: function(localScheduleLoader, scheduleHandlerFactory, contentViewController) {
        return localScheduleLoader.loadSchedule().then(function(scheduleData) {
          var scheduleHandler = scheduleHandlerFactory(contentViewController);
          scheduleHandler.setScheduleData(scheduleData);
          scheduleHandler.cycleViews
          (contentViewController.createContentViews(scheduleData.items));
        });
      }
    };
  }());

  if (typeof window === "undefined") {
    module.exports = starter;
  } else {
    starter.start($rv.localScheduleLoader, $rv.scheduleHandlerFactory, $rv.contentViewController);
  }
}());
