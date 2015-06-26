(function mainWindowEvents() {
  "use strict";

  var contentEventHandlers = [];

  contentEventHandlers.push(require("../platform/content-event-handlers/bypass-cors.js"));

  window.addEventListener("load", function() {
    showOptionsMenu();
  });

  function showOptionsMenu() {
    var screenWidth = screen.availWidth,
    screenHeight = screen.availHeight;

    var boundsSpecification = {
      width: Math.round(screenWidth * 2/4),
      height: Math.round(screenHeight * 2/4),
      left: Math.round(screenWidth * 1/4),
      top: Math.round(screenHeight * 1/4)
    };

    chrome.app.window.create("player/options/options-page.html", {
      id: "options-win",
      alwaysOnTop: true,
      outerBounds: boundsSpecification
    });
  }

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

    return handler[0].process(evt);

    function respondWithError(err) {
      evt.data.error = err;
      evt.source.postMessage(evt.data, "*");
    }
  });
}());
