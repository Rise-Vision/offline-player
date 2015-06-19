module.exports = function(remoteFolderFetcher) {
  return {
    createListener: function(hash) {
      localFilesystemUrls = remoteFolderFetcher.getFolderItems()[hash];

      function findUrlEntry(requestedPath) {
        if (!localFilesystemUrls) {return false;}
        for(var i = 0; i < localFilesystemUrls.length; i += 1) {
          if (requestedPath.indexOf("/" + localFilesystemUrls[i].url) > -1) {
            return localFilesystemUrls[i].localUrl;
          }
        }

        return false;
      }

      return function(fetchDetails) {
        var cacheUrl = findUrlEntry(fetchDetails.url);
        console.log("requesting url " + fetchDetails.url);

        if (!cacheUrl) {return {};}
        return {redirectUrl: cacheUrl};
      };
    }
  };
};
