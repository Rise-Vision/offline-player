module.exports = function remoteScheduleLoad(platformIOFunctions, coreUrls) {
  "use strict";
  var url = coreUrls.scheduleFetchUrl;

  if (!platformIOFunctions.isNetworkConnected) {return Promise.resolve();}

  return getDisplayIdFromLocalStorage()
  .then(fetchRemoteScheduleContentJson)
  .then(retrieveScheduleFromContentObject) 
  .then(saveNewLocalSchedule)
  .catch(function(err) {
    console.error(err);
  });

  function getDisplayIdFromLocalStorage() {
    return new Promise(function(resolve, reject) {
      chrome.storage.local.get(["displayId"], function(item) {
        if (chrome.runtime.lastError || !item.displayId) {
          return reject(new Error("Remote schedule retriever: error retrieving display id from local storage"));
        }

        resolve(item.displayId);
      });
    });
  }
  
  function fetchRemoteScheduleContentJson(displayId) {
    var url = url.replace("DISPLAY_ID", displayId);
    console.log("Remote schedule retriever: retrieval for: " + displayId);

    return platformIOFunctions.httpFetcher(url, {credentials: "include"})
    .then(function(resp) {
      return resp.json();
    });
  }

  function retrieveScheduleFromContentObject(json) {
    if (!json.content || !json.content.schedule) {
      console.info(JSON.stringify(json));
      throw new Error("Remote schedule retriever: no schedule data in response");
    }
    return json.content.schedule;
  }

  function saveNewLocalSchedule(schedule) {
    return new Promise(function (resolve, reject) {
      platformIOFunctions.localStorage.set({schedule: schedule}, function() {
        if (platformIOFunctions.hasErrorState) {
          return reject(new Error("Remote schedule retriever: error saving schedule"));
        }
        console.log("Remote schedule retriever: saved schedule");
        resolve();
      });
    });
  }
};
