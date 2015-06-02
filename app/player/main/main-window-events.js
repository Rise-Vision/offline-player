(function mainWindowEvents() {
  "use strict";

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
    if (evt.data.type != "bypasscors" ) {
      respondWithError("Message type should be 'bypasscors'");
      return false;
    }
    if (!evt.data.url || evt.data.url.indexOf("http") !== 0) {
      respondWithError("URL must contain scheme name");
      return false;
    }

    fetch(evt.data.url)
    .then(function(resp) {
      return resp.text();
    })
    .then(function(resp) {
      evt.data.response = resp;
      evt.source.postMessage(evt.data, "*");
    })
    .then(null, function(err) {
      respondWithError(err.toString());
    });

    return true;

    function respondWithError(err) {
      evt.data.error = err;
      evt.source.postMessage(evt.data, "*");
    }
  });
}());
