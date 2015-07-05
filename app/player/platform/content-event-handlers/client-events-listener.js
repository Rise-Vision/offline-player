module.exports = function(serviceUrls, platformIO, remoteFolderFetcher, contentViewController, uiController) {
  var contentEventHandlers = [];

  addContentEventHandler(require("./bypass-cors.js")());
  addContentEventHandler(require("./storage-component-load.js")(platformIO, uiController));
  addContentEventHandler(require("./storage-component-response.js")(serviceUrls, platformIO, remoteFolderFetcher, uiController));

  uiController.registerWindowListener("message", function(evt) {
    var handlers = contentEventHandlers.filter(function(handler) {
      return handler.handles(evt);
    });

    if(handlers.length === 0) {
      return respondWithError("No handlers were found for the event");
    }
    else if(handlers.length > 1) {
      return respondWithError("Only one handler can exist for the given event");
    }

    return handlers[0].process(evt, contentViewController.getViewUrl(evt.source));

    function respondWithError(err) {
      evt.data.error = err;
      uiController.sendWindowMessage(evt.source, evt.data, "*");

      return Promise.reject(new Error(err));
    }
  });

  platformIO.registerGCMListener(function(message) {
    var targets = JSON.parse(message.data.targets);
    var currentTime = new Date().getTime();
    var promises = [];
    
    // Refresh presentations
    targets.forEach(function(target) {
      ["http"].forEach(function(protocol) {
        var presentationFolder = protocol + "://storage.googleapis.com/" + target.substr(0, target.lastIndexOf("/") + 1);

        // If the folder does no exist locally, it means it was created as a subfolder by a different process (storage-component, for instance)
        if(platformIO.hasPreviouslySavedFolder(presentationFolder)) {
          promises.push(remoteFolderFetcher.fetchFoldersIntoFilesystem([{ objectReference: presentationFolder }]).then(function() {
            return contentViewController.reloadMatchingPresentations(presentationFolder, false);
          }));
        }
      });
    });
    
    Promise.all(promises).then(function() {
      var views = document.querySelectorAll("webview");

      for(var i = 0; i < views.length; i++) {
        var clientPage = views[i];

        // Only post message to views that were not refreshed
        if(clientPage.creationTime > currentTime) {
          clientPage.contentWindow.postMessage({ type: "storage-target-changed", targets: targets }, "*");
        }
      }
    });
  });

  function resetContentEventHandlers() {
    contentEventHandlers = [];
  }

  function addContentEventHandler(handler) {
    contentEventHandlers.push(handler);
  }

  return {
    resetContentEventHandlers: resetContentEventHandlers,
    addContentEventHandler: addContentEventHandler
  };
};
