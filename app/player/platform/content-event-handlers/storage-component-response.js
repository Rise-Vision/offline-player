module.exports = function(deps) {
  return {
    handles: function(evt) {
      return evt.data.type === "storage-component-response";
    },

    process: function(evt) {
      var resp = evt.data.response;
      var items;

      if (!resp) {
        respondWithError("response field must exist");
        return false;
      }

      // Process a single file or a list of files. 
      if(resp.selfLink) {
        items = [ resp ];
      }
      else {
        items = resp.items;
      }

      items = items.filter(function(item) {
        return item.name && item.name.slice(-1) !== "/";
      });

      deps.remoteFolderFetcher.saveItemsList(items.map(function(item) {
        return item.selfLink + "?alt=media";
      })).then(function(files) {
        for(var i = 0; i < files.length; i++) {
          items[i].selfLink = files[i];
        }

        // Send processed list of files to client
        evt.source.postMessage({ type: "storage-component-response-updated", response: resp }, "*");
      });

      return true;

      function respondWithError(err) {
        evt.data.error = err;
        evt.source.postMessage(evt.data, "*");
      }
    }
  };
};
