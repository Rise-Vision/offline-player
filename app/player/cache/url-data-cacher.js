module.exports = function(platformIOFunctions) {
  var schedule = {}, urlHashes = {};

  function isRiseStorage(url) {
    return /risemedialibrary-.{36}\//.test(url);
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
        if (!isRiseStorage(url)) {
          return Promise.resolve(true);
        }

        return platformIOFunctions.httpFetcher(url)
        .then(function(resp) {
          return resp.blob();
        })
        .then(function(resp) {
          var urlHash = platformIOFunctions.hash(url);
          urlHashes[url] = urlHash;
          return platformIOFunctions.filesystemSave(urlHash + ".html", resp);
        })
        .catch(function(err) {
          console.log("Url data fetcher: Could not fetch url data into filesystem");
        });
      }));
    }
  };
};
