"use strict";

chrome.runtime.onInstalled.addListener(onLaunchListener);

function onLaunchListener() {
  var windowOptions = { state: "fullscreen" },
      windowPath="player/main/main-chrome-app-window.html";

  chrome.app.window.create(windowPath, windowOptions);
}
