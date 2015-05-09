"use strict";

chrome.app.runtime.onLaunched.addListener(onLaunchListener);

function onLaunchListener(launchData) {
  var windowOptions = { state: "fullscreen" },
      windowPath="player/main/main-chrome-app-window.html";

  chrome.app.window.create(windowPath, windowOptions);
}
