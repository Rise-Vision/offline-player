"use strict";

$rv.localScheduleLoader = {
  schedulePath: "../schedule/default.json",
  xhr: null,
  observers: null,
  resolveLoadSchedulePromise: null,

  scheduleLoadedHandler: function scheduleLoadedHandler() {
    $rv.schedule.scheduleData =
    $rv.localScheduleLoader.xhr.response.content.schedule;

    $rv.localScheduleLoader.resolveLoadSchedulePromise();
  },

  setupXHR: function setupXHR() {
    $rv.localScheduleLoader.xhr = new XMLHttpRequest();
    $rv.localScheduleLoader.xhr.responseType = "json";
    $rv.localScheduleLoader.xhr.addEventListener
    ("load", $rv.localScheduleLoader.scheduleLoadedHandler);
  },

  loadSchedule: function loadSchedule() {
    $rv.localScheduleLoader.setupXHR();

    return new Promise(function(resolve) {
      $rv.localScheduleLoader.xhr.open
      ("GET", $rv.localScheduleLoader.schedulePath);

      $rv.localScheduleLoader.resolveLoadSchedulePromise = resolve;
      $rv.localScheduleLoader.xhr.send();
    });
  }
};
