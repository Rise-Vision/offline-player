module.exports = function(platformIOFunctions) {
  var folderItems = [];

  return {
    getUrlHashes: function() {return urlHashes;},

    fetchFoldersIntoFilesystem: function(scheduleItems) {
      return Promise.all(scheduleItems.map(function(scheduleItem) {
        var url = scheduleItem.objectReference;
        if (url.indexOf("risemedialibrary-") === -1) {
          return Promise.resolve("not fetching unless Rise Storage folder");
        }

        return platformIOFunctions.getRemoteFolderItemsList(url)
        .then(function(resp) {
          folderItems = resp;
        })
        .catch(function(err) {
          console.log("Remote folder fetcher: Could not retrieve folder contents");
        });
      }));
    },

    getFolderItems: function() { return folderItems;}
  };
};


/*
          var urlHash = platformIOFunctions.hash(url);
          urlHashes[url] = urlHash;
          return platformIOFunctions.filesystemSave(urlHash, "html", resp);
*/
