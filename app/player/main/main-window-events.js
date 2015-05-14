(function mainWindowEvents() {
  "use strict";
  window.document.addEventListener("click", function() {
    showOptionsMenu();
  });

  window.addEventListener("online", function() {
    goOnline();
  });

  window.addEventListener("load", function() {
    if (navigator.onLine) {
      goOnline();
    }
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

  function goOnline() {
  }
}());
