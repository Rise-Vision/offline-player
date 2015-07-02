module.exports = function(platformIO, remoteFolderFetcher, contentViewController) {
  var contentEventHandlers = [];

  contentEventHandlers.push(require("../platform/content-event-handlers/bypass-cors.js")());
  contentEventHandlers.push(require("../platform/content-event-handlers/storage-component-load.js")(platformIO));
  contentEventHandlers.push(require("../platform/content-event-handlers/storage-component-response.js")(platformIO, remoteFolderFetcher));

  window.addEventListener("message", function(evt) {
    var handlers = contentEventHandlers.filter(function(handler) {
      return handler.handles(evt);
    });

    if(handlers.length === 0) {
      respondWithError("No handlers were found for the event");
      return false;
    }
    else if(handlers.length > 1) {
      respondWithError("Only one handler can exist for the given event");
      return false;
    }

    return handlers[0].process(evt);

    function respondWithError(err) {
      evt.data.error = err;
      evt.source.postMessage(evt.data, "*");
    }
  });

  chrome.gcm.onMessage.addListener(function(message) {
    var targets = JSON.parse(message.data.targets);
    var currentTime = new Date().getTime();
    var promises = [];
    
    targets.forEach(function(target) {
      ["http"].forEach(function(protocol) {
        var presentationFolder = protocol + "://storage.googleapis.com/" + target.substr(0, target.lastIndexOf("/") + 1);

        if(platformIO.hasPreviouslySavedFolder(presentationFolder)) {
          promises.push(remoteFolderFetcher.fetchFoldersIntoFilesystem([{ objectReference: presentationFolder }]).then(function() {
            return contentViewController.reloadMatchingPresentations(presentationFolder, false);
          }));
        }
      });
    });

    // Only post message to views that were not reloaded
    Promise.all(promises).then(function() {
      var views = document.querySelectorAll("webview");

      for(var i = 0; i < views.length; i++) {
        var clientPage = views[i];

        if(clientPage.creationTime > currentTime) {
          clientPage.contentWindow.postMessage({ type: "storage-target-changed", targets: targets }, "*");
        }
      }
    });
  });
};
