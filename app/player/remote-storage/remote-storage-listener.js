module.exports = function(platformIO, cache, contentViewController, uiController, remoteFolderFetcher) {
  return function(message) {
    var targets = JSON.parse(message.data.targets);
    var promises = [];

    targets.forEach(function(target) {
      ["http", "https"].forEach(function(protocol) {
        var presentationFolder = protocol + "://storage.googleapis.com/" + target.substr(0, target.lastIndexOf("/") + 1);

        promises.push(cache.hasPreviouslySavedSchedule(presentationFolder) 
        .then(function(previouslySaved) {
          if (previouslySaved) {
            return remoteFolderFetcher.fetchFoldersIntoFilesystem
            ([{ objectReference: presentationFolder }])
            .then(function() {
              return contentViewController.reloadMatchingPresentations
              (presentationFolder, false);
            });
          } else {
            return [];
          }
        }));
      });
    });

    return Promise.all(promises).then(function(reloadedViews) {
      var views = contentViewController.getContentViews();
      reloadedViews = reloadedViews.reduce(function(prev, curr) {
        return prev.concat(curr);
      });

      for(var key in views) {
        if(reloadedViews.indexOf(key) === -1) {
          uiController.sendWindowMessage
          (views[key].contentWindow, {
            type: "storage-target-changed", targets: targets
          }, "*");
        }
      }
    });
  };
};
