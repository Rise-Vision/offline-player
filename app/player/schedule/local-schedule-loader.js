module.exports = function localScheduleLoader(timelineParser) {
  "use strict";
  var emptySchedule = require("./empty-schedule.js");

  return new Promise(function(resolve, reject) {
    chrome.storage.local.get(["schedule"], function(storageObject) {
      var schedule = storageObject.schedule;
      if (chrome.runtime.lastError) {
        return reject(new Error("error retrieving local schedule"));
      }

      if (!schedule || !schedule.hasOwnProperty("items")) {
        console.info("Local schedule loader: invalid schedule format");
        return resolve(emptySchedule);
      }

      console.info(JSON.stringify(schedule.items[0]));
      schedule.items = schedule.items.filter(isUrlType).filter(isPlayable);

      if (schedule.items.length === 0) {
        console.info("Local schedule loader: schedule is empty");
        return resolve(emptySchedule);
      }

      resolve(schedule);
    });
  });

  function isUrlType(item) {return item.type === "url";}

  function isPlayable(item) {
    try {
      timelineParser.isPlayable(item, new Date());
    } catch(e) {
      console.info("Local schedule loader: not playable - " + e.message);
      return false;
    }
    return true;
  }
};

