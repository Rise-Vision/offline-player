module.exports = function() {
  var eventHandlers = [];

  function dispatchMessage(evt) {
    var promises = eventHandlers.filter(function(handler) {
      return handler.handles(evt);
    })
    .map(function(handler) {
      return handler.process(evt);
    });

    return Promise.all(promises);
  }

  return {
    dispatchMessage: dispatchMessage,
    addEventHandler: function(handler) {
      eventHandlers.push(handler);
    },
    resetEventHandlers: function() {
      eventHandlers = [];
    },
    createChannel: function(token) {
      var view = document.createElement("webview");

      view.style.display = "none";
      view.partition = "persist:channel-proxy";
      view.src = "../../content/channel-proxy/index.html";

      document.body.appendChild(view);

      function sendRegistrationMessage() {
        view.removeEventListener("loadstop", sendRegistrationMessage);

        view.contentWindow.postMessage({
          type: "create-channel",
          token: token
        }, "*");
      }

      view.addEventListener("loadstop", sendRegistrationMessage);
      view.addEventListener("message", dispatchMessage);

      return Promise.resolve();
    }
  };
};
