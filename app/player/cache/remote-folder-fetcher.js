module.exports = function(platformIOFunctions) {
  var folderItems = {};

  return {
    fetchFoldersIntoFilesystem: function(scheduleItems) {
      return Promise.all(scheduleItems.map(function(scheduleItem) {
        var url = scheduleItem.objectReference,
        mainUrlPath = url.substr(0, url.lastIndexOf("/") + 1);

        if (!/risemedialibrary-.{36}\//.test(url)) {
          return Promise.resolve("not fetching unless Rise Storage folder");
        }

        if (!platformIOFunctions.isNetworkConnected()) {
          return refreshPreviouslySavedFolders(mainUrlPath);
        }

        return platformIOFunctions.getRemoteFolderItemsList(url)
        .then(function(resp) {
          folderItems[mainUrlPath] = resp;
          return mainUrlPath;
        })
        .then(function() {
          return saveFolderItems(mainUrlPath);
        })
        .then(function() {
          platformIOFunctions.localObjectStore.set({folderItems: folderItems});
        })
        .catch(function(err) {
          var msg = "Remote folder fetcher: Could not retrieve folder " +
          "contents for " + url;
          console.log(msg);
        });
      }));
    },

    getFolderItems: function() { return folderItems;}
  };

  function saveFolderItems(mainUrlPath) {
    return folderItems[mainUrlPath].reduce(function(prev, curr) {
      return prev.then(function() {
        return platformIOFunctions.httpFetcher(curr.url)
        .then(function(resp) {
          return resp.blob();
        })
        .then(function(blob) {
          var fileName = platformIOFunctions.hash(mainUrlPath + curr.filePath) +
          getExt(curr.filePath);
          return platformIOFunctions.filesystemSave(fileName, blob); 
        })
        .then(function(url) {
          curr.localUrl = url;
        });
      });
    }, Promise.resolve());
  }

  function getExt(filePath) {
    var lastDot = filePath.lastIndexOf("."), ext;
    ext = lastDot === -1 ? "" :
    filePath.substr(filePath.lastIndexOf("."));
    return ext;
  }

  function refreshPreviouslySavedFolders(mainUrlPath) {
    return platformIOFunctions.localObjectStore.get(["folderItems"])
    .then(function(storageItems) {
      folderItems = storageItems.folderItems;
      return Promise.all
      (folderItems[mainUrlPath].map(function(folderItem) {
        var ext = getExt(folderItem.filePath);
        return platformIOFunctions.filesystemRetrieve(
        platformIOFunctions.hash(mainUrlPath + folderItem.filePath) + ext)
        .then(function(obj) {
          return (folderItem.localUrl = obj.url);
        });
    }));})
    .catch(function(err) {
      console.log("Could not refresh previously saved folders");
      console.log(err);
    });
  }
};
