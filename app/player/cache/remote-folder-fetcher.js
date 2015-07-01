module.exports = function(platformIO) {
  return {
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
    }
  };
};
