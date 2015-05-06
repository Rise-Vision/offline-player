"use strict";

chrome.runtime.onInstalled.addListener(onLaunchListener);

function onLaunchListener() {
  var windowOptions = { state: "fullscreen" };

  chrome.app.window.create("main-chrome-app-window.html", windowOptions);
}
