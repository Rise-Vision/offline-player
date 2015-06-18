module.exports = function(remoteFolderFetcher, platformIOProvider) {
  return {
    createListener: function(hash) {
      return function(fetchDetails) {
        var cacheUrl;
        console.log("requesting url " + fetchDetails.url);

        cacheUrl = remoteFolderFetcher.getUrl(hash, fetchDetails.url);
        if (!cacheUrl) {return:}
        return {redirectUrl: cacheUrl};
      }
    }
  };
};
