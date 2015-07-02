module.exports = function(platformIO) {
  return {
    handles: function(evt) {
      return evt.data.type === "storage-component-load";
    },

    process: function(evt) {
      var url = evt.data.url;
      var promise;

      if (!url) {
        respondWithError("url field must exist");
        return false;
      }

      if(platformIO.isNetworkConnected()) {
        promise = fetch(url)
        .then(function(resp) {
          return resp.json();
        })
        .then(function(json) {
          return platformIO.localObjectStore.get(["storageComponentData"]).then(function (data) {
          	data = data.storageComponentData || {};
          	data[url] = json;

          	return platformIO.localObjectStore.set({ storageComponentData: data}).then(function() {
          	  return data[url];
          	});
          });
        });
      }
      else {
      	promise = platformIO.localObjectStore.get(["storageComponentData"]).then(function (data) {
      	  return data.storageComponentData && data.storageComponentData[url];
      	});
      }

      return promise.then(function(data) {
      	evt.source.postMessage({ type: "storage-component-loaded", response: data }, "*");
      }, function(err) {
      	evt.source.postMessage({ type: "storage-component-loaded", message: "Failed to fetch data" }, "*");
      });

      function respondWithError(err) {
        evt.data.error = err;
        evt.source.postMessage(evt.data, "*");
      }
    }
  };
};