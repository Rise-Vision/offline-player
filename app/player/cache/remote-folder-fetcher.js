module.exports = function(platformFS, platformIO) {
  function saveFolderItems(mainUrlPath, items) {
    return items.reduce(function(prev, curr) {
      return prev.then(function() {
        return platformIO.httpFetcher(curr.remoteUrl)
        .then(function(resp) {
          return resp.blob();
        })
        .then(function(blob) {
          return platformFS.filesystemSave(mainUrlPath, curr.filePath, blob);
        });
      });
    }, Promise.resolve());
  }

  return {
    fetchFilesIntoFilesystem: function(mainUrlPath, files) {
      return saveFolderItems(mainUrlPath, files);
    },

    fetchFoldersIntoFilesystem: function(scheduleItems) {
      if (!platformIO.isNetworkConnected()) {
        return Promise.reject(new Error("no network connection"));
      }

      return platformFS.hasFilesystemSpace()
      .then(function() {
        return Promise.all(scheduleItems.map(function(scheduleItem) {
          var url = scheduleItem.objectReference,
          mainUrlPath = url.substr(0, url.lastIndexOf("/") + 1);

          return checkItemConditions()
          .then(function() {
            console.log("A");
            return platformIO.getRemoteFolderItemsList(url);
          })
          .then(function(items) {
            console.log("B");
            return saveFolderItems(mainUrlPath, items);
          })
          .catch(function(err) {
            var msg = "Remote folder fetcher: Not retrieving folder " +
            "contents for " + url;
            console.log(msg + "\n  -" + err.message, err);
          });

          function checkItemConditions() {
            if (!/risemedialibrary-.{36}\//.test(url)) {
              return Promise.reject
              (new Error("not a Rise Storage folder"));
            }

            return platformFS.hasPreviouslySavedFolder(mainUrlPath)
            .then(function(hasPreviouslySavedFolder) {
              if (hasPreviouslySavedFolder) {
                throw new Error("folder exists");
              }
            });
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
