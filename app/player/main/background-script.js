(function() {
  function background(chrome, screen) {
    chrome.app.runtime.onLaunched.addListener(onLaunchListener);

    function onLaunchListener() {
      var windowOptions = { state: "fullscreen" },
          windowPath="player/main/main-chrome-app-window.html";

      chrome.app.window.create(windowPath, windowOptions);

      showOptionsMenu();
    }

    function showOptionsMenu() {
      var screenWidth = screen.availWidth,
      screenHeight = screen.availHeight;

      var boundsSpecification = {
        width: Math.round(screenWidth * 2/4),
        height: Math.round(screenHeight * 2/4),
        left: Math.round(screenWidth * 1/4),
        top: Math.round(screenHeight * 1/4)
      };

      chrome.app.window.create("player/options/options-page.html",
      {
        id: "options-win",
        alwaysOnTop: true,
        outerBounds: boundsSpecification
      });
    }
  }

  if (typeof module === "undefined") {
    background(chrome, screen);
  } else {
    module.exports = background;
  }
}());
