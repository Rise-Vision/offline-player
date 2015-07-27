var source, origin, token;

function initializeEventHandler(evt) {
  source = evt.source;
  origin = evt.origin;
  token = evt.data.token;
}

function createChannelIFrame() {
  var container = document.querySelector("#iframeContainer");
  var iframe = document.createElement("iframe");

  iframe.setAttribute("src", "channel-iframe-contents.html");
  iframe.style.width = "0";
  iframe.style.height = "0";

  container.appendChild(iframe);
}

function destroyChannelIFrame() {
  var container = document.querySelector("#iframeContainer");
  var iframe = document.querySelector("#channelIFrame");

  if(container && iframe) {
    iframe.contentWindow.disconnect();
    container.removeChild(iframe);
  }
}

function channelEvent(eventName) {
  console.log("channelEvent", eventName);
  source.postMessage({
    type: "channel-event",
    message: eventName
  }, origin);
}

function channelMessage(message) {
  console.log("channelMessage", message);
  source.postMessage({
    type: "channel-message",
    message: message
  }, origin);
}

function channelError(code, description) {
  console.log("channelError", code, description);
  source.postMessage({
    type: "channel-error",
    code: code,
    description: description
  }, origin);
}

window.addEventListener("message", function(evt) {
  if(evt.data.type === "create-channel") {
    initializeEventHandler(evt);
    destroyChannelIFrame();
    createChannelIFrame();
  }
  else if(evt.data.type === "reset-channel") {
    destroyChannelIFrame();
    createChannelIFrame();
  }
  else if(evt.data.type === "destroy-channel") {
    destroyChannelIFrame();
  }
}, false);
