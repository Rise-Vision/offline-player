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

  function showItem(itemNumber) {
    var duration = parseInt(scheduleData.items[itemNumber].duration, 10);

    if (!scheduleData.items[itemNumber].duration) {
      console.log("Content cycler: no duration in schedule item" + 
      JSON.stringify(scheduleData.items[itemNumber]));
      return false;
    }

    contentViewController.showView(scheduleData.items[itemNumber].objectReference);

    timeoutHandle = setTimeout(function() {
      showNextItem(itemNumber);
    }, duration * 1000);
  }

  function showNextItem(itemNumber) {
    contentViewController.hideView(scheduleData.items[itemNumber].objectReference);

    itemNumber += 1;
    if (itemNumber === scheduleData.items.length) {
      itemNumber = 0;
    }

    showItem(itemNumber);
  }
}

module.exports = contentCycler;
