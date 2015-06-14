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
        console.info("Local schedule loader: schedule empty or invalid format");
        return resolve(emptySchedule);
      }

      if (!isPlayable(schedule)) {
        console.info("Local schedule loader: schedule timeline is not met");
        console.info(JSON.stringify(schedule));
        return resolve(emptySchedule);
      }

      console.log("item count: " + schedule.items.length);
      schedule.items = schedule.items.filter(isUrlType).filter(isPlayable);
      console.info(JSON.stringify(schedule.items));

      if (schedule.items.length === 0) {
        console.info("Local schedule loader: schedule is empty");
        return resolve(emptySchedule);
      }

      resolve(schedule);
    });
  });

  function isUrlType(item) {return item.type === "url";}

  function isPlayable(item) {
    console.info("checking playability for " + item.name);

    try {
      timelineParser.isPlayable(item, new Date());
    } catch(e) {
      console.info("Local schedule loader: " + item.name + " not playable - " + e.message);
      return false;
    }
    console.log(item.name + " is playable");
    return true;
  }
};

