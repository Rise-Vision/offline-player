module.exports = function(messageDetailRetriever, uiController) {
  var channelView, channelWindow, channelToken;
  var eventHandlers = [];

  function processMessage(evt) {
    if(evt.data.type && evt.data.type.indexOf("channel") === 0) {
      var message = evt.data.message;

      if(message && message.indexOf("updated") === 0) {
        return fetchMessage(message)
        .then(dispatchMessage);
      }
      else if(message === "ayt") {
        return Promise.resolve(resetChannel());
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

  function resetChannel() {
    uiController.sendWindowMessage(channelWindow, {
      type: "reset-channel",
      token: channelToken
    }, "*");
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
      channelView = document.createElement("webview");
      channelView.style.display = "none";
      channelView.partition = "persist:channel-proxy";
      channelView.src = "../../content/channel-proxy/index.html";

      channelWindow = channelView.contentWindow;
      channelToken = token;

      document.body.appendChild(channelView);

      function sendRegistrationMessage() {
        channelView.removeEventListener("loadstop", sendRegistrationMessage);

        uiController.sendWindowMessage(channelWindow, {
          type: "create-channel",
          token: channelToken
        }, "*");
      }

      channelView.addEventListener("loadstop", sendRegistrationMessage);
      window.addEventListener("message", processMessage);

      return Promise.resolve();
    }
  };
};
