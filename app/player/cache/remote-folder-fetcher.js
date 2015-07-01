module.exports = function(platformIO) {
  function saveFolderItems(mainUrlPath, items) {
    return items.reduce(function(prev, curr) {
      return prev.then(function() {
        return platformIO.httpFetcher(curr.remoteUrl)
        .then(function(resp) {
          return resp.blob();
        })
        .then(function(blob) {
          return platformIO.filesystemSave(mainUrlPath, curr.filePath, blob); 
        });
      });
    }, Promise.resolve());
  }

  return {
    fetchFilesIntoFilesystem: function(mainUrlPath, files) {
      return saveFolderItems(mainUrlPath, files);
    },

    fetchFoldersIntoFilesystem: function(scheduleItems) {
      var gcmTargets = [];

      return Promise.all(scheduleItems.map(function(scheduleItem) {
        var url = scheduleItem.objectReference,
        mainUrlPath = url.substr(0, url.lastIndexOf("/") + 1);
        gcmTargets.push(mainUrlPath);

        return checkConditions()
        .then(function() {
          return platformIO.getRemoteFolderItemsList(url);
        })
        .then(function(items) {
          return saveFolderItems(mainUrlPath, items);
        })
        .catch(function(err) {
          var msg = "Remote folder fetcher: Not retrieving folder " +
          "contents for " + url;
          console.log(msg + "\n  -" + err.message);
        });

        function checkConditions() {
          if (!/risemedialibrary-.{36}\//.test(url)) {
            return Promise.reject
            (new Error("not a Rise Storage folder"));
          }

          if (!platformIO.isNetworkConnected()) {
            return Promise.reject(new Error("no network connection"));
          }

          return platformIO.hasPreviouslySavedFolder(mainUrlPath)
          .then(function(hasPreviouslySavedFolder) {
            if (hasPreviouslySavedFolder) {
              throw new Error("folder exists");
            }
          });
        }
      })).then(function(results) {
        platformIO.registerTargets(gcmTargets, true);

        return results;
      });
    }
  };
};
