module.exports = function(platformIO, contentViewController, uiController, remoteFolderFetcher) {

  (function registerRemoteStorage() {
    platformIO.localObjectStore.get(["gcmRegistrationId"])
    .then(function(result) {
      var gcmProjectId = "642011540044";
      
      if (!result.gcmRegistrationId) {
        platformIO.registerRemoteStorageId(gcmProjectId);
      }
    });
  }());

  return function(message) {
    var targets = JSON.parse(message.data.targets);
    var currentTime = new Date().getTime();
    var promises = [];

    // Refresh presentations
    targets.forEach(function(target) {
      ["http", "https"].forEach(function(protocol) {
        var presentationFolder = protocol + "://storage.googleapis.com/" + target.substr(0, target.lastIndexOf("/") + 1);

        // If the folder does no exist locally, it means it was created as a subfolder by a different process (storage-component, for instance)
        if(platformIO.hasPreviouslySavedFolder(presentationFolder)) {
          promises.push(remoteFolderFetcher.fetchFoldersIntoFilesystem([{ objectReference: presentationFolder }]).then(function() {
            return contentViewController.reloadMatchingPresentations(presentationFolder, false);
          }));
        }
      });
    });

    return Promise.all(promises).then(function() {
      var views = contentViewController.getContentViews();

      for(var key in views) {
        var clientPage = views[key];

        // Only post message to views that were not refreshed
        if(clientPage.creationTime > currentTime) {
          uiController.sendWindowMessage(clientPage.contentWindow, { type: "storage-target-changed", targets: targets }, "*");
        }
      }
    });
  }
});
