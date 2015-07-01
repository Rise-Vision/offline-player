module.exports = function(platformIO, remoteFolderFetcher) {
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
    var clientPage = document.querySelector("webview").contentWindow;

    clientPage.postMessage({ type: "storage-target-changed", targets: message.data.targets }, "*");
  });
};
