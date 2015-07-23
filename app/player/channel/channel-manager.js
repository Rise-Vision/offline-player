module.exports = function() {
  return {
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

      return Promise.resolve();
    }
  };
};
