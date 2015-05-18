function localScheduleLoader() {
  "use strict";
  var emptySchedule = require("./empty-schedule.js");

  return new Promise(function(resolve, reject) {
    chrome.storage.local.get(["schedule"], function(storageObject) {
      var schedule = storageObject.schedule;
      if (chrome.runtime.lastError) {
        return reject(new Error("error retrieving local schedule"));
      }

      if (!schedule || !schedule.hasOwnProperty("items") ||
      schedule.items.length === 0 ||
      !schedule.items.some(isUrlType)) {
        console.info("Local schedule loader: schedule is invalid");
        return resolve(emptySchedule);
      }

      schedule.items = schedule.items.filter(isUrlType);
      resolve(schedule);
    });
  });
}

function isUrlType(item) {return item.type === "url";}
module.exports = localScheduleLoader;
