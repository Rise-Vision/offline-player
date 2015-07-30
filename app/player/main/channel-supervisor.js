module.exports = function(ioProvider, channelManager, onlineStatusObserver) {
  function handleNetworkStatusChange(status) {
    if(status) {
      return channelManager.createChannel();
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
