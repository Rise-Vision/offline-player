module.exports = function(tokenRetriever, messageDetailRetriever, uiController) {
  var channelView, channelWindow, channelToken;
  var eventHandlers = [];

  function updateToken() {
    if(!channelToken) {
      return tokenRetriever.getToken().then(function(newToken) {
        channelToken = newToken;
        return channelToken;
      });      
    }
    else {
      return Promise.resolve(channelToken);
    }
  }

  function createChannelWindow() {
    channelView = document.createElement("webview");
    channelView.style.display = "none";
    channelView.partition = "persist:channel-proxy";
    channelView.src = "../../content/channel-proxy/index.html";

    document.body.appendChild(channelView);

    function sendRegistrationMessage() {
      channelWindow = channelView.contentWindow;

      channelView.removeEventListener("loadstop", sendRegistrationMessage);

      uiController.sendWindowMessage(channelWindow, {
        type: "create-channel",
        token: channelToken
      }, "*");
    }

    channelView.addEventListener("loadstop", sendRegistrationMessage);
    window.addEventListener("message", processMessage);

    logger.external("channel create");

    return Promise.resolve();    
  }

  function destroyChannel() {
    if(channelView) {
      uiController.sendWindowMessage(channelWindow, {
        type: "destroy-channel"
      }, "*");

      document.body.removeChild(channelView);
      channelView = null;
      channelWindow = null;

      return logger.external("channel destroy");
    }
    else {
      return Promise.resolve();
    }
  }

  function processMessage(evt) {
    var type = evt.data.type;
    var message = evt.data.message;

    if(type && type.indexOf("channel") === 0) {
      if(message && message.indexOf("updated") === 0) {
        logger.external("channel updated");
        return fetchMessage(message)
        .then(dispatchMessage);
      }
      else if(message === "ayt") {
        logger.external("channel ayt");
        resetChannel();
        return Promise.resolve();
      }
      else if(type === "channel-event") {
        logger.external(message);
        return Promise.resolve();
      }
      else if(type === "channel-error") {
        logger.external(evt.data.code + " - " + evt.data.description);

        if(Number(evt.data.code) === 401) {
          channelToken = null;

          return destroyChannel()
          .then(updateToken)
          .then(createChannelWindow);
        }

        return Promise.resolve();
      }
    }
    else {
      return Promise.reject();
    }
  }

  function fetchMessage(message) {
    return messageDetailRetriever
      .getMessageDetail(message.substring("updated".length));
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
    logger.external("channel reset");

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
    createChannel: function() {
      return updateToken()
      .then(createChannelWindow);
    },
    destroyChannel: destroyChannel
  };
};
