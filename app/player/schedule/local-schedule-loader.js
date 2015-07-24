module.exports = function localScheduleLoader(timelineParser, externalLogger, platformIO) {
  "use strict";
  var emptySchedule = require("./empty-schedule.js");

  return new Promise(function(resolve, reject) {
    console.log("A");
    logger.external("schedule load");
    chrome.storage.local.get(["schedule"], function(storageObject) {
      var schedule = storageObject.schedule;
      if (chrome.runtime.lastError) {
        return reject(new Error("error retrieving local schedule"));
      }

      if (!schedule || !schedule.hasOwnProperty("items")) {
        console.info("Local schedule loader: schedule empty or invalid format");

        if (platformIO.isNetworkConnected()) {
          externalLogger.sendEvent("no schedule");
          return resolve(emptySchedule("No content to show. Please assign" +
          " this display to a schedule."));
        }

        return resolve(emptySchedule("Unable to retrieve the schedule for this " +
        "display. Please make sure this device is connected to the Internet."));
      }

      if (!isPlayable(schedule)) {
        console.info("Local schedule loader: schedule timeline is not met");
        console.info(JSON.stringify(schedule));
        return resolve(emptySchedule("The schedule timeline for this display " +
        "is not met."));
      }

      console.log("item count: " + schedule.items.length);
      schedule.items = schedule.items.filter(isUrlType).filter(isPlayable);
      console.info(JSON.stringify(schedule.items));

      if (schedule.items.length === 0) {
        console.info("Local schedule loader: schedule is empty");
        externalLogger.sendEvent("empty schedule");
        return resolve(emptySchedule("No content to show. The schedule " +
        "for this display is empty or has no playable items based on their" +
        " configured timelines."));
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

