module.exports = function(remoteFolderFetcher) {
  return {
    createListener: function(mainUrlPath) {
      localFilesystemUrls = remoteFolderFetcher.getFolderItems()[mainUrlPath];

      return function fetchIntercept(fetchDetails) {
        var cacheUrl = findUrlEntry(fetchDetails.url);
        console.log("requesting url " + fetchDetails.url);

        if (!cacheUrl) {return {};}
        return {redirectUrl: cacheUrl};
      };

      function findUrlEntry(requestedUrl) {
        var requestedPath = requestedUrl.substr(mainUrlPath.length);
        if (!localFilesystemUrls) {return false;}
        for(var i = 0; i < localFilesystemUrls.length; i += 1) {
          if (requestedPath === localFilesystemUrls[i].filePath) {
            return localFilesystemUrls[i].localUrl;
          }
        }

        return false;
      }
    }
  };
};
