module.exports = function(platformIO, htmlParser) {
  var folderItems = {};

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

  return {
    saveItemsList: function(parentFolder, urls) {
      var mainUrlPath = parentFolder;
      var promises = [];
      var startPromise = null;

      if (!platformIO.isNetworkConnected()) {
        console.log("if (!platformIO.isNetworkConnected()) {", mainUrlPath, folderItems[mainUrlPath], folderItems);
        startPromise = refreshPreviouslySavedFolders(mainUrlPath).then(function() {
          return platformIO.localObjectStore.set({folderItems: folderItems});
        });
      }
      else {
        startPromise = Promise.resolve();
      }

      return startPromise.then(function() {
        urls.forEach(function(url) {
          var decodedURL = decodeURIComponent(url);
          var fileName = decodedURL.substr(decodedURL.lastIndexOf("/") + 1).replace("?alt=media", "");

          folderItems[mainUrlPath] = folderItems[mainUrlPath] || {};

          if (platformIO.isNetworkConnected() && /risemedialibrary-.{36}\//.test(url) && !folderItems[mainUrlPath][fileName]) {
            promises.push(platformIO.httpFetcher(url)
            .then(function(resp) {
              return resp.blob();
            })
            .then(function(blob) {
              return platformIO.filesystemSave(mainUrlPath + fileName, blob);
            })
            .then(function(resp) {
              folderItems[mainUrlPath][fileName] = { localUrl: resp };
              return resp;
            }));
          }
          else if(folderItems[mainUrlPath][fileName]) {
            promises.push(Promise.resolve(folderItems[mainUrlPath][fileName].localUrl));
          }
          else if(!/risemedialibrary-.{36}\//.test(url)) {
            promises.push(Promise.resolve("not fetching unless Rise Storage file"));
          }
          else {
            promises.push(Promise.resolve("player is in offline mode and the file is not stored locally"));
          }
        });

        return Promise.all(promises)
        .then(function(results) {
          return platformIO.localObjectStore.set({folderItems: folderItems}).then(function() {
            return results;
          });
        })
        .then(function(results) {
          platformIO.registerTargets([parentFolder], false);

          return results;
        });
      });
    },

    fetchFoldersIntoFilesystem: function(scheduleItems) {
      var gcmTargets = [];

      return Promise.all(scheduleItems.map(function(scheduleItem) {
        var url = scheduleItem.objectReference,
        mainUrlPath = url.substr(0, url.lastIndexOf("/") + 1);

        if (!/risemedialibrary-.{36}\//.test(url)) {
          return Promise.resolve("not fetching unless Rise Storage folder");
        }

        if (!platformIO.isNetworkConnected()) {
          return Promise.resolve();
        }

        gcmTargets.push(mainUrlPath);

        return platformIO.getRemoteFolderItemsList(url)
        .then(saveFolderItems)
        .catch(function(err) {
          var msg = "Remote folder fetcher: Could not retrieve folder " +
          "contents for " + url;
          console.log(msg + "\n" + err.message);
        });

        function saveFolderItems(items) {
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
      })).then(function(results) {
        if (!platformIO.isNetworkConnected()) {
          platformIO.registerTargets(gcmTargets, true);
        }

        return results;
      });
    },
  };
};
