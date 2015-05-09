"use strict";

$rv.localScheduleLoader = {
  schedulePath: "../schedule/default.json",
  xhr: null,
  observers: null,
  resolveLoadSchedulePromise: null,

  loadSchedule() {
    var that = this;
    this.setupXHR();

    return new Promise(function(resolve) {
      that.xhr.open("GET", that.schedulePath);

      that.resolveLoadSchedulePromise = resolve;
      that.xhr.send();
    });
  },

  scheduleLoadedHandler() {
    this.resolveLoadSchedulePromise(this.xhr.response.content.schedule);
  },

  setupXHR() {
    var that = this;
    this.xhr = new XMLHttpRequest();
    this.xhr.responseType = "json";
    this.xhr.addEventListener("load", function() {
      that.scheduleLoadedHandler();
    });
  }
};
