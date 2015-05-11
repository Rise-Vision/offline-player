(function() {
  "use strict";

  var localScheduleLoader = (function() {
    var schedulePath = "../schedule/default.json",
    xhr = null,
    resolveLoadSchedulePromise = null;

    function scheduleLoadedHandler() {
      resolveLoadSchedulePromise(xhr.response.content.schedule);
    }

    function setupXHR() {
      xhr = new XMLHttpRequest();
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
  }());

  if (typeof window === "undefined") {
    module.exports = localScheduleLoader;
  } else {
    $rv.localScheduleLoader = localScheduleLoader;
  }
}());
