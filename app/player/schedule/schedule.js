"use strict";

$rv.schedule = {
  webviews: [],
  scheduleData: {},
  timeoutHandle: null,

  createItemWebviews() {
    var that = this;

    this.scheduleData.items.forEach(function(item) {
      var wv = document.createElement("webview");
      wv.style.height = document.body.clientHeight + "px";
      wv.style.width = document.body.clientWidth + "px";
      wv.style.display = "none";
      wv.partition = "persist:" + item.name;
      wv.src = item.objectReference;

      that.webviews.push(wv);
      document.body.appendChild(wv);
    });
  },

  cycleItems() {
    clearTimeout(this.timeoutHandle);
    this.showItem(0);

  },

  showItem(item) {
    var wv = this.webviews[item],
    duration = parseInt(this.scheduleData.items[item].duration, 10),
    that;

    wv.style.display = "block";
    that = this;
    this.timeoutHandle = setTimeout(function() {
      that.showNextItem(item);
    }, duration * 1000);
  },

  hideItem(item) {
    this.webviews[item].style.display = "none";
  },

  showNextItem(item) {
    this.hideItem(item);
    item += 1;
    if (item === this.scheduleData.items.length) {
      item = 0;
    }

    this.showItem(item);
  }
};

