(function() {
  "use strict";
  var contentViewController = require("./content-view-controller.js")(document),
  localScheduleLoader = require("./local-schedule-loader.js")(new XMLHttpRequest()),
  scheduleHandler = require("./schedule-handler.js")(contentViewController);

  localScheduleLoader.loadSchedule().then(function(scheduleData) {
    scheduleHandler.setScheduleData(scheduleData);
    scheduleHandler.cycleViews
      (contentViewController.createContentViews(scheduleData.items));
  });
}());
