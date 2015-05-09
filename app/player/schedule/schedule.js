"use strict";

$rv.schedule = {
  webviews: [],
  scheduleData: {},
  timeoutHandle: null,

  createItemWebviews: function() {
    $rv.schedule.scheduleData.items.forEach(function(item) {
      var wv = document.createElement("webview");
      wv.style.height = document.body.clientHeight + "px";
      wv.style.width = document.body.clientWidth + "px";
      wv.style.display = "none";
      wv.partition = "persist:" + item.name;
      wv.src = item.objectReference;

      $rv.schedule.webviews.push(wv);
      document.body.appendChild(wv);
    });
  },

  cycleItems: function() {
    clearTimeout($rv.schedule.timeoutHandle);
    showItem(0);

    function showItem(item) {
      var wv = $rv.schedule.webviews[item],
      duration = parseInt($rv.schedule.scheduleData.items[item].duration, 10);

      wv.style.display = "block";
      $rv.schedule.timeoutHandle = setTimeout(function() {
        showNextItem(item);
      }, duration * 1000);
    }

    function showNextItem(item) {
      hideItem(item);
      item += 1;
      if (item === $rv.schedule.scheduleData.items.length) {
        item = 0;
      }

      showItem(item);
    }

    function hideItem(item) {
      $rv.schedule.webviews[item].style.display = "none";
    }
  }
};

