module.exports = function(platformIO, uiController) {
  return {
    handles: function(evt) {
      return evt.data.type === "storage-component-load";
    },

    process: function(evt) {
      var url = evt.data.url;

      if (!url) {
        return respondWithError("url field must exist");
      }

      return getResponseToUrl(url)
      .then(sendResponseToListeners, sendErrorToListeners);

      function getResponseToUrl(url) {
        if(platformIO.isNetworkConnected()) {
          return fetchDataFromRemoteUrl(url);
        }
        else {
          return restoreDataFromLocalStorage(url);
        }
      }

      function fetchDataFromRemoteUrl(url) {
        return platformIO.httpFetcher(url)
        .then(function(resp) {
          return resp.json();
        })
        .then(function(json) {
          return platformIO.localObjectStore.get(["storageComponentData"]).then(function (data) {
            data = data.storageComponentData || {};
            data[url] = json;

            return platformIO.localObjectStore.set({ storageComponentData: data }).then(function() {
              return data[url];
            });
          });
        });
      }

      function restoreDataFromLocalStorage(url) {
        return platformIO.localObjectStore.get(["storageComponentData"]).then(function (data) {
          return data.storageComponentData && data.storageComponentData[url];
        });
      }

      function sendResponseToListeners(data) {
        uiController.sendWindowMessage(evt.source, { type: "storage-component-loaded", clientId: evt.data.clientId, response: data }, "*");
      }

      function sendErrorToListeners(err) {
        console.log("sendErrorToListeners", err);
        uiController.sendWindowMessage(evt.source, { type: "storage-component-loaded", clientId: evt.data.clientId, error: "Failed to fetch data" }, "*");
      }

      function respondWithError(err) {
        evt.data.error = err;
        uiController.sendWindowMessage(evt.source, evt.data, "*");

        return Promise.reject(new Error(err));
      }
    }
  };
};
