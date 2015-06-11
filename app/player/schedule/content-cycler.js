function contentCycler(contentViewController) {
  "use strict";
  var scheduleData = {},
  timeoutHandle = null;

  return {
    setScheduleData: function setScheduleData(newScheduleData) {
      scheduleData = newScheduleData;
    },

    getScheduleData: function getScheduleData() {
      return scheduleData;
    },

    cycleViews: function cycleViews() {
      clearTimeout(timeoutHandle);
      showItem(0);
    }
  };

  function showItem(item) {
    var duration = parseInt(scheduleData.items[item].duration, 10);

    contentViewController.showView(item);

    timeoutHandle = setTimeout(function() {
      showNextItem(item);
    }, duration * 1000);
  }

  function showNextItem(item) {
    contentViewController.hideView(item);

    item += 1;
    if (item === scheduleData.items.length) {
      item = 0;
    }

    showItem(item);
  }
}

module.exports = contentCycler;
