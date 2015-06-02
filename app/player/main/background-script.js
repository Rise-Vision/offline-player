chrome.app.runtime.onLaunched.addListener(onLaunchListener);

function onLaunchListener() {
  var windowOptions = { state: "fullscreen" },
      windowPath="player/main/main-window.html";

  chrome.app.window.create(windowPath, windowOptions);
}

chrome.runtime.onMessage.addListener(function(msg,sender,fn) {
  if (sender.id !== chrome.runtime.id) {return;}
  if (msg.type != "bypasscors" ) {
    respondWithError("Message type should be 'bypasscors'");
    return false;
  }
  if (!msg.url || msg.url.indexOf("http") !== 0) {
    respondWithError("URL must contain scheme name");
    return false;
  }

  fetch(msg.url)
  .then(function(resp) {
    return resp.text();
  })
  .then(function(resp) {
    msg.response = resp;
    fn(msg);
  })
  .then(null, function(err) {
    respondWithError(err.toString());
  });

  return true;

  function respondWithError(err) {
    msg.error = err;
    fn(msg);
  }
});
