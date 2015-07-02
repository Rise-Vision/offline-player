module.exports = function(platformIO) {
  return {
    fetchFoldersIntoFilesystem: function(scheduleItems) {
      if (!platformIO.isNetworkConnected()) {
        return Promise.reject(new Error("no network connection"));
      }

      return platformIO.hasFilesystemSpace()
      .then(function() {
        return Promise.all(scheduleItems.map(function(scheduleItem) {
          var url = scheduleItem.objectReference,
          mainUrlPath = url.substr(0, url.lastIndexOf("/") + 1);

          return checkItemConditions()
          .then(function() {
            return platformIO.getRemoteFolderItemsList(url);
          })
          .then(saveFolderItems)
          .catch(function(err) {
            var msg = "Remote folder fetcher: Not retrieving folder " +
            "contents for " + url;
            console.log(msg + "\n  -" + err.message);
          });

          function checkItemConditions() {
            if (!/risemedialibrary-.{36}\//.test(url)) {
              return Promise.reject
              (new Error("not a Rise Storage folder"));
            }

            return platformIO.hasPreviouslySavedFolder(mainUrlPath)
            .then(function(hasPreviouslySavedFolder) {
              if (hasPreviouslySavedFolder) {
                throw new Error("folder exists");
              }
            });
          }

          function saveFolderItems(items) {
            return items.reduce(function(prev, curr) {
              return prev.then(function() {
                return platformIO.httpFetcher(curr.remoteUrl)
                .then(function(resp) {
                  return resp.blob();
                })
                .then(function(blob) {
                  return platformIO.filesystemSave
                  (mainUrlPath, curr.filePath, blob); 
                });
              });
            }, Promise.resolve());
          }
        }));
      })
      .catch(function(err) {
        var msg = "Remote folder fetcher: Not retrieving any folder contents." +
        "\n -" + err.message;
        console.log(msg);
        return msg;
      });
    },
  };
};
