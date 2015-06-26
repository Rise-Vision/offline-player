module.exports = function(platformIO) {
  var folderItems = {};

  return {
    fetchFoldersIntoFilesystem: function(scheduleItems) {
      return Promise.all(scheduleItems.map(function(scheduleItem) {
        var url = scheduleItem.objectReference,
        mainUrlPath = url.substr(0, url.lastIndexOf("/") + 1);

        if (!/risemedialibrary-.{36}\//.test(url)) {
          return Promise.resolve("not fetching unless Rise Storage folder");
        }

        if (!platformIO.isNetworkConnected()) {
          return refreshPreviouslySavedFolders(mainUrlPath)
          .then(function() {
            return platformIO.localObjectStore.set({folderItems: folderItems});
          });
        }

        return platformIO.getRemoteFolderItemsList(url)
        .then(saveFolderItems)
        .then(function() {
          return platformIO.localObjectStore.set({folderItems: folderItems});
        })
        .catch(function(err) {
          var msg = "Remote folder fetcher: Could not retrieve folder " +
          "contents for " + url;
          console.log(msg + err);
        });

        function saveFolderItems(items) {
          folderItems[mainUrlPath] = {};
          return items.reduce(function(prev, curr) {
            return prev.then(function() {
              return platformIO.httpFetcher(curr.remoteUrl)
              .then(function(resp) {
                return resp.blob();
              })
              .then(function(blob) {
                return platformIO.filesystemSave(mainUrlPath + curr.filePath, blob); 
              })
              .then(function(resp) {
                folderItems[mainUrlPath][curr.filePath] = {localUrl: resp};
              });
            });
          }, Promise.resolve());
        }

        function refreshPreviouslySavedFolders(mainUrlPath) {
          return platformIO.localObjectStore.get(["folderItems"])
          .then(function(storageItems) {
            folderItems = storageItems.folderItems;
            return Promise.all
            (Object.keys(folderItems[mainUrlPath]).map(function(itemKey) {
              return platformIO.filesystemRetrieve(mainUrlPath + itemKey)
              .then(function(obj) {
                folderItems[mainUrlPath][itemKey] = {localUrl: obj.url};
              });
            }));
          })
          .catch(function(err) {
            console.log("Could not refresh previously saved folders");
            console.log(err);
          });
        }
      }));
    },

    getFolderItems: function() { return folderItems;}
  };
};
