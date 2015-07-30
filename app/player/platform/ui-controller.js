function clearViewCache(view) {
  return new Promise(function(resolve, reject) {
    if (view.nodeName === "WEBVIEW") {
      // If a timeout is not used, the callback is never invoked or fails when calling reload
      setTimeout(function() {
        try {
          view.clearData({}, {
            "appcache": true,
            "cache": true,
            "cookies": true,
            "indexedDB": true,
            "localStorage": true,
            "webSQL": true
          }, function() {
            console.log("Cache cleared; reloading view");
            resolve(view);
          });
        }
        catch (e) {
          console.log("Cache clear failed");
          resolve(view);
        }
      }, 500);
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
      setTimeout(function() {
        try {
          view.contentWindow.postMessage("register.chrome.app.window", "*");
          view.contentWindow.postMessage({ type: "offline-player-init" }, "*");
          view.removeEventListener("loadstop", sendRegistrationMessage);
          view.removeEventListener("load", sendRegistrationMessage);
        } catch(e) {
          logger.console("Failed window registration");
          logger.external("failed window registration");
        }
      }, 0);
    }

    return Promise.resolve(view);
  },

  sendWindowMessage: function(targetWindow, messageObj, dest) {
    targetWindow.postMessage(messageObj, dest);
  },

  registerWindowListener: function(event, listener) {
    window.addEventListener(event, listener);
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

  removeView: function(view) {document.body.removeChild(view);},

  clearViewCache: clearViewCache
};
