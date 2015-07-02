function clearViewCache(view) {
  return new Promise(function(resolve, reject) {
    if (view.nodeName === "WEBVIEW") {
      // If a small timeout is not used, the callback is never invoked or fails
      setTimeout(function() {
        view.clearData({}, {
          "appcache": true,
          "cache": true,
          "indexedDB": true,
          "localStorage": true,
        }, function() {
            console.log("Cleared!");
            view.reload();
            resolve(view);
          }
        );        
      }, 5000);
    }
    else { // iframe
      resolve(view);
    }
  });
}

module.exports = {
  createViewWindow: function(contentTarget) {
    if (!contentTarget) {
      console.log("UI Controller: No content target for view creation");
      return false;
    }

    var view,
    type = "webview";

    if (/^filesystem/.test(contentTarget)) {type = "iframe";}
    view =  document.createElement(type);

    view.style.height = document.body.clientHeight + "px";
    view.style.width = document.body.clientWidth + "px";
    view.style.display = "none";

    if (type === "webview") {
      view.partition = "persist:" + 
      (contentTarget.indexOf("../") === 0 ? "packaged" : contentTarget);
    }

    view.creationTime = new Date().getTime();
    view.src = contentTarget;
    console.log("appending " + contentTarget + " to view type:" + type);
    document.body.appendChild(view);

    if (type === "webview") {
      view.addEventListener("loadstop", sendRegistrationMessage);
    } else {
      view.addEventListener("load", sendRegistrationMessage);
    }

    function sendRegistrationMessage() {
      view.contentWindow.postMessage("register.chrome.app.window", "*");
      view.contentWindow.postMessage({ type: "offline-player-init" }, "*");
      view.removeEventListener("loadstop", sendRegistrationMessage);
      view.removeEventListener("load", sendRegistrationMessage);
    }

    return clearViewCache(view);
  },

  setVisibility: function(el, vis) {
    if (vis) {
      el.style.display = "block";
      el.requestPointerLock();
    } else {
      el.style.display = "none";
    } 
  },

  isVisible: function(el) {
    return el.style.display === "block";
  },

  removeView: function(view) {document.body.removeChild(view);}
};
