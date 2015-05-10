"use strict";

$rv.schedule = (function() {
  var webviews = [],
  scheduleData = {},
  timeoutHandle = null;

  return {
    setScheduleData(newScheduleData) {
      scheduleData = newScheduleData;
      removeItemWebviews();
      createItemWebviews();
      cycleItems();
    }
  };

  function removeItemWebviews() {
    webviews.forEach(function(item) {
      document.removeChild(item);
    });

    webviews = [];
  }

  function createItemWebviews() {
    scheduleData.items.forEach(function(item) {
      var wv = document.createElement("webview");
      wv.style.height = document.body.clientHeight + "px";
      wv.style.width = document.body.clientWidth + "px";
      wv.style.display = "none";
      wv.partition = "persist:" + item.name;
      wv.src = item.objectReference;
      wv.addEventListener("loadStop", function() {
        wv.insertCSS("body {cursor: none}");
      });

      webviews.push(wv);
      document.body.appendChild(wv);
    });
  }

  function cycleItems() {
    clearTimeout(timeoutHandle);
    showItem(0);
  }

  function showItem(item) {
    var wv = webviews[item],
    duration = parseInt(scheduleData.items[item].duration, 10);

    wv.style.display = "block";
    timeoutHandle = setTimeout(function() {
      showNextItem(item);
    }, duration * 1000);
  }

  function hideItem(item) {
    webviews[item].style.display = "none";
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
