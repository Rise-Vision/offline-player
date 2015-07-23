var socket;

function connectChannel(reason, token) {
  parent.channelEvent("connecting");
  channel = new goog.appengine.Channel(token);

  socket = channel.open({
    onopen: function onOpen() {
      parent.channelEvent("connected");
    },
    onmessage: function onMessage(message) {
      parent.channelMessage(message.data);
    },
    onerror: function onError(error) {
      parent.channelError(error.code, error.description);
    },
    onclose: function onClose() {
      parent.channelEvent("closed");
    }
  });
}

function disconnectChannel() {
  try {
    if (socket) {
      socket.close();
      parent.channelEvent("socketClosed");
    }
  }
  catch (err) {
    parent.channelEvent("socketCloseFailed");
  }
}
