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
}

function channelMessage(message) {
  console.log("channelMessage", message);
}

function channelError(code, description) {
  console.log("channelError", code, description);
}

window.addEventListener("message", function(evt) {
  if(evt.data.type === "create-channel") {
    initializeEventHandler(evt);
    destroyChannelIFrame();
    createChannelIFrame();
  }
}, false);
