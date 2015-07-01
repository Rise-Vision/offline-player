module.exports = function(platformIO, remoteFolderFetcher) {
  return {
    handles: function(evt) {
      return evt.data.type === "storage-component-response";
    },

    process: function(evt) {
      var resp = evt.data.response;
      var items, companyId, parentFolder, promise;

      if (!resp) {
        respondWithError("response field must exist");
        return false;
      }

      // Process a single file or a list of files. 
      items = resp.selfLink ? [resp] : resp.items;
      companyId = decodeURIComponent(items[0].selfLink).match(/.*\/risemedialibrary-(.{36})\/.*/)[1];
      parentFolder = decodeURIComponent(items[0].selfLink.replace("/o", ""));
      parentFolder = parentFolder.substr(0, parentFolder.lastIndexOf("/") + 1);

      items = items.filter(function(item) {
        return item.name && item.name.slice(-1) !== "/";
      }).map(function(item) {
        item.filePath = "rise-storage-component-resources/" + companyId + "/" + decodeURIComponent(item.name);
        item.remoteUrl = item.selfLink + "?alt=media";

        return item;
      });

      if(platformIO.isNetworkConnected()) {
        var presentationUrl = document.querySelector("webview").src;
        var presentationFolder = presentationUrl.substr(0, presentationUrl.lastIndexOf("/") + 1);

        promise = remoteFolderFetcher.fetchFilesIntoFilesystem(presentationFolder, items);
        
        platformIO.registerTargets([parentFolder], false);
      }
      else {
        promise = Promise.resolve();
      }
      
      promise.then(function() {
        items.forEach(function(item) {
          item.selfLink = platformIO.isNetworkConnected() ? item.remoteUrl : item.filePath;
        });

        evt.source.postMessage({type: "storage-component-response-updated", response: resp}, "*");
      });

      return true;

      function respondWithError(err) {
        evt.data.error = err;
        evt.source.postMessage(evt.data, "*");
      }
    }
  };
};
