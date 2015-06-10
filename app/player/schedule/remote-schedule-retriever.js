module.exports = function(platformIOFunctions, coreUrls) {
  "use strict";
  var url = coreUrls.scheduleFetchUrl;

  return {
    loadRemoteSchedule: function() {
      if (!platformIOFunctions.isNetworkConnected()) {
        return Promise.resolve(false);
      }

      return getDisplayIdFromLocalStorage()
      .then(fetchRemoteScheduleContentJson)
      .then(retrieveScheduleFromContentObject) 
      .then(saveNewLocalSchedule);
    }
  };

  function getDisplayIdFromLocalStorage() {
    return new Promise(function(resolve, reject) {
      platformIOFunctions.localStorage.get(["displayId"], function(item) {
        if (platformIOFunctions.hasErrorState() || !item.displayId) {
          return reject(err("error retrieving display id from local storage"));
        }

        resolve(item.displayId);
      });
    });
  }
  
  function fetchRemoteScheduleContentJson(displayId) {
    url = url.replace("DISPLAY_ID", displayId);
    console.log("Remote schedule retriever: retrieval for: " + displayId);

    return platformIOFunctions.httpFetcher(url, {credentials: "include"})
    .then(function(resp) {
      return resp.json();
    });
  }

  function retrieveScheduleFromContentObject(json) {
    if (!json.content || !json.content.schedule) {
      console.info(JSON.stringify(json));
      throw new Error(err("no schedule data in response"));
    }
    return json.content.schedule;
  }

  function saveNewLocalSchedule(schedule) {
    return new Promise(function (resolve, reject) {
      platformIOFunctions.localStorage.set({schedule: schedule}, function() {
        if (platformIOFunctions.hasErrorState()) {
          return reject(err("error saving schedule"));
        }
        console.log("Remote schedule retriever: saved schedule");
        resolve(true);
      });
    });
  }

  function err(msg) {
    return new Error("Remote schedule retriever: " + msg);
  }
};
