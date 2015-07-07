chrome.app.runtime.onLaunched.addListener(onLaunchListener);

function onLaunchListener() {
  var windowOptions = { state: "fullscreen" },
      windowPath="player/main/main-window.html";

  chrome.app.window.create(windowPath, windowOptions);
}
