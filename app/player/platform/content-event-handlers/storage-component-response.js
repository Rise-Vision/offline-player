module.exports = function(serviceUrls, platformIO, remoteFolderFetcher, uiController) {
  return {
    handles: function(evt) {
      return evt.data.type === "storage-component-response";
    },

    process: function(evt, presentationUrl) {
      var resp = evt.data.response;
      
      if (!resp) {
        return respondWithError("response field must exist");
      }

      // Process a single file or a list of files. 
      var items = resp.selfLink ? [resp] : resp.files;

      return generateLocalAndRemoteUrls(items)
      .then(fetchFilesIntoFilesystem)
      .then(function() {
        return sendProcessedResponse(resp, items);
      });

      function generateLocalAndRemoteUrls(items) {
        var companyId = decodeURIComponent(items[0].selfLink).match(/.*\/risemedialibrary-(.{36})\/.*/)[1];

        return Promise.resolve(items.filter(function(item) {
          return item.name && item.name.slice(-1) !== "/";
        }).map(function(item) {
          item.filePath = "rise-storage-component-resources/" + companyId + "/" + decodeURIComponent(item.name);
          item.remoteUrl = item.selfLink + "?alt=media";

          return item;
        }));
      }

      function fetchFilesIntoFilesystem(items) {
        if(platformIO.isNetworkConnected()) {
          var presentationFolder = presentationUrl.substr(0, presentationUrl.lastIndexOf("/") + 1);

          return remoteFolderFetcher.fetchFilesIntoFilesystem(presentationFolder, items).then(function(result) {
            registerTargets(items);

            return items;
          }); 
        }
        else {
          return Promise.resolve();
        }
      }

      function registerTargets(items) {
        var parentFolder = decodeURIComponent(items[0].selfLink.replace("/o", ""));

        parentFolder = parentFolder.substr(0, parentFolder.lastIndexOf("/") + 1);
        return platformIO.registerTargets(serviceUrls.registerTargetUrl, [{ objectReference: parentFolder }], false);
      }

      function sendProcessedResponse(resp, items) {
        var message = {type: "storage-component-response-updated", clientId: evt.data.clientId, response: resp};

        items.forEach(function(item) {
          item.selfLink = platformIO.isNetworkConnected() ? item.remoteUrl : item.filePath;
        });

        uiController.sendWindowMessage(evt.source, message, "*");
      }

      function respondWithError(err) {
        evt.data.error = err;
        uiController.sendWindowMessage(evt.source, evt.data, "*");

        return Promise.reject(new Error(err));
      }
    }
  };
};
