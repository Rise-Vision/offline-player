module.exports = function(platformIOFunctions) {
  var schedule = {}, urls = [];

  return {
    setSchedule: function(sched) {
      schedule = sched;
      schedule.items.forEach(function(item) {
        urls.push(item.objectReference);
      });
    },
    getUrls: function() {return urls;},

    saveUrlDataToFilesystem: function() {
      return Promise.all(urls.map(function(url) {
        return platformIOFunctions.httpFetcher(url)
        .then(function(resp) {
          return resp.blob();
        })
        .then(function(resp) {
          var urlHash = platformIOFunctions.hash(url);
          return platformIOFunctions.filesystemSave(urlHash, resp);
        });
      }));
    }
  };
};
