"use strict";

$rv.scheduleHandler = (function() {
  var contentViews = [],
  scheduleData = {},
  timeoutHandle = null;

  return {
    setScheduleData(newScheduleData) {
      if (newScheduleData === "test") {
        scheduleData.items.forEach(function(item) {
          item.duration = 0;
        });
      } else {
        scheduleData = newScheduleData;
      }
    },

    cycleViews(views) {
      contentViews = views || contentViews;
      clearTimeout(timeoutHandle);
      showItem(0);
    }
  };

  function showItem(item) {
    var wv = contentViews[item],
    duration = parseInt(scheduleData.items[item].duration, 10);

    wv.style.display = "block";
    wv.requestPointerLock();

    timeoutHandle = setTimeout(function() {
      showNextItem(item);
    }, duration * 1000);
  }

  function hideItem(item) {
    contentViews[item].style.display = "none";
  }

  function showNextItem(item) {
    hideItem(item);

    item += 1;
    if (item === scheduleData.items.length) {
      item = 0;
    }

    showItem(item);
  }
}());
