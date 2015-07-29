module.exports = function(ioProvider, tokenRetriever, channelManager, onlineStatusObserver) {
  var token;

  function updateToken() {
    return tokenRetriever.getToken().then(function(newToken) {
      token = newToken;
      return token;
    });
  }

  function handleNetworkStatusChange(status) {
    if(status) {
      var promise = token ? Promise.resolve(token) : updateToken();

      return promise.then(channelManager.createChannel);
    }
    else if(token) {
      return channelManager.destroyChannel();
    }
    else {
      return Promise.reject("Not connected to network");
    }
  }

  return {
    start: function() {
      onlineStatusObserver.addEventHandler(handleNetworkStatusChange);

      if(ioProvider.isNetworkConnected()) {
        return handleNetworkStatusChange(true);
      }
      else {
        console.log("Error creating channel: not connected to the network");
        return Promise.resolve();
      }
    }
  };
};
