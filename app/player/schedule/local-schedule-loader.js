(function() {
  "use strict";

  function localScheduleLoaderFactory(xhr) {
    var schedulePath = "../schedule/default.json",
    resolveLoadSchedulePromise = null;

    function scheduleLoadedHandler() {
      resolveLoadSchedulePromise(xhr.response.content.schedule);
    }

    function setupXHR() {
      xhr.responseType = "json";
      xhr.addEventListener("load", function() {
        scheduleLoadedHandler();
      });
    }

    return {
      loadSchedule: function() {
        setupXHR();

        return new Promise(function(resolve) {
          xhr.open("GET", schedulePath);

          resolveLoadSchedulePromise = resolve;
          xhr.send();
        });
      }
    };
  }

  if (typeof window === "undefined") {
    module.exports = localScheduleLoaderFactory;
  } else {
    $rv.localScheduleLoader = localScheduleLoaderFactory(new XMLHttpRequest());
  }
}());
