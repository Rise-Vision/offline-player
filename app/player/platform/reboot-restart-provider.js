module.exports = function(platformInfo, contentViewController) {
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

    return Promise.resolve();
  }

  return {
    restart: function() {
      return contentViewController.reloadPresentations()
      .then(showOptionsMenu);
    },
    reboot: function() {
      return new Promise(function(resolve, reject) {
        if(platformInfo.basePlatform === "cros") {
          chrome.runtime.restart();
          // If the app is in non-kiosk mode then as per documentation restart is no-op, and in this case the promise will be rejected
          reject();
        }
        else {
          reject();
        }
      });
    }
  };
};
