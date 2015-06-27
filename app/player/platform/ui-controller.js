var contentEventHandlers = [];

contentEventHandlers.push(require("../platform/content-event-handlers/bypass-cors.js"));
contentEventHandlers.push(require("../platform/content-event-handlers/storage-component-response.js"));

module.exports = {
  createViewWindow: function(contentTarget) {
    if (!contentTarget) {
      console.log("UI Controller: No content target for view creation");
      return false;
    }

    var view =  document.createElement("webview");
    view.style.height = document.body.clientHeight + "px";
    view.style.width = document.body.clientWidth + "px";
    view.style.display = "none";
    view.partition = "persist:" + 
    (contentTarget.indexOf("../") === 0 ? "packaged" : contentTarget);
    view.src = contentTarget;
    console.log("appending " + contentTarget);
    document.body.appendChild(view);

    view.addEventListener("loadstop", sendRegistrationMessage);
    view.addEventListener("message", function(evt) {
      console.log("Received event", evt);

      var handlers = contentEventHandlers.filter(function(handler) {
        return handler.handles(evt);
      });

      if(handlers.length === 0) {
        respondWithError("No handlers were found for the event");
        return false;
      }
      else if(handlers.length > 1) {
        respondWithError("Only one handler can exist for the given event");
        return false;
      }

      return handler[0].process(evt);

      function respondWithError(err) {
        evt.data.error = err;
        evt.source.postMessage(evt.data, "*");
      }
    });

    function sendRegistrationMessage() {
      view.contentWindow.postMessage("register.chrome.app.window", "*");
      view.contentWindow.postMessage({ type: "offline-player-init" }, "*");
      view.removeEventListener("loadstop", sendRegistrationMessage);
    }

    return view;
  },

  setVisibility: function(el, vis) {
    if (vis) {
      el.style.display = "block";
      el.requestPointerLock();
    } else {
      el.style.display = "none";
    } 
  },

  removeView: function(view) {document.body.removeChild(view);},
};
