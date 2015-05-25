function remoteScheduleLoad() {
  "use strict";
  var url = require("../options/core-urls.js").scheduleFetchUrl;

  if (!navigator.onLine) {return;}

  new Promise(function(resolve, reject) {
    chrome.storage.local.get(["displayId"], function(item) {
      if (chrome.runtime.lastError || !item.displayId) {
        return reject(new Error("Remote schedule retriever: error retrieving display id from local storage"));
      }

      resolve(item.displayId);
    });
  })
  .then(function(id) {
    console.log("Remote schedule retriever: retrieval for: " + id);
    return fetch(url.replace("DISPLAY_ID", id), {credentials: "include"});
  })
  .then(function(resp) {
    return resp.json();
  })
  .then(function(json) {
    if (!json.content || !json.content.schedule) {
      throw new Error("Remote schedule retriever: no schedule data in response");
    }
    return json.content.schedule;
  })
  .then(function(schedule) {
    return new Promise(saveLocalSchedule(schedule));
  })
  .then(null, function(err) {
    console.error(err);
  });


  function saveLocalSchedule(schedule) {
    return function saveLocalSchedule(resolve, reject) {
      chrome.storage.local.set({schedule: schedule}, function() {
        if (chrome.runtime.lastError) {
          return reject(new Error("Remote schedule retriever: error saving schedule"));
        }
        console.log("Remote schedule retriever: saved schedule");
        resolve();
      });
    };
  }
}

module.exports = remoteScheduleLoad;
