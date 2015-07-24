module.exports = function(messageDetailRetriever) {
  var eventHandlers = [];

  function processMessage(evt) {
    if(evt.data.type && evt.data.type.indexOf("channel") === 0) {
      var message = evt.data.message;

      if(message && message.indexOf("updated") === 0) {
        return fetchMessage(message)
        .then(dispatchMessage);
      }
    }
    else {
      return Promise.reject();
    }
  }

  function fetchMessage(message) {
    return messageDetailRetriever.getMessageDetail(message.substring("updated".length));
  }

  function dispatchMessage(messageDetail) {
    var promises = eventHandlers.filter(function(handler) {
      return handler.handles(messageDetail);
    })
    .map(function(handler) {
      return handler.process(messageDetail);
    });

    return Promise.all(promises);
  }

  return {
    processMessage: processMessage,
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
      window.addEventListener("message", processMessage);

      return Promise.resolve();
    }
  };
};
