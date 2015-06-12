module.exports = function(platformIOFunctions) {
  var schedule = {}, urlHashes = {};

  return {
    setSchedule: function(sched) {
      schedule = sched;
      schedule.items.forEach(function(item) {
        urlHashes[item.objectReference] = "";
      });
    },
    getUrlHashes: function() {return urlHashes;},

    saveUrlDataToFilesystem: function() {
      return Promise.all(Object.keys(urlHashes).map(function(url) {
        return platformIOFunctions.httpFetcher(url)
        .then(function(resp) {
          return resp.blob();
        })
        .then(function(resp) {
          var urlHash = platformIOFunctions.hash(url);
          urlHashes[url] = urlHash;
          return platformIOFunctions.filesystemSave(urlHash, resp);
        });
      }));
    }
  };
};
