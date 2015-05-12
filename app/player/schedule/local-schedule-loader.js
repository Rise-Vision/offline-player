function localScheduleLoaderFactory(xhr) {
  "use strict";
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

module.exports = localScheduleLoaderFactory;
