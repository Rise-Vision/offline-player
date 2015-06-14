module.exports = function(platformIOFunctions) {
  var schedule = {}, urlHashes = {};

  function isLocalFile(url) {
    return url.indexOf("../") === 0;
  }

  return {
    setSchedule: function(sched) {
      schedule = sched;
      schedule.items.forEach(function(item) {
        urlHashes[item.objectReference] = "";
      });
    },
    getUrlHashes: function() {return urlHashes;},

    fetchUrlDataIntoFilesystem: function() {
      return Promise.all(Object.keys(urlHashes).map(function(url) {
        if (isLocalFile(url)) {
          return Promise.resolve(true);
        }

        return platformIOFunctions.httpFetcher(url)
        .then(function(resp) {
          return resp.blob();
        })
        .then(function(resp) {
          var urlHash = platformIOFunctions.hash(url);
          urlHashes[url] = urlHash;
          return platformIOFunctions.filesystemSave(urlHash, resp);
        })
        .catch(function(err) {
          console.log("Url data fetcher: Could not fetch data into filesystem");
        });
      }));
    }
  };
};
