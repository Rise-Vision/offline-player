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

    view.src = contentTarget;
    console.log("appending " + contentTarget);
    document.body.appendChild(view);

    if (type === "webview") {
      view.addEventListener("loadstop", sendRegistrationMessage);
    } else {
      view.addEventListener("load", sendRegistrationMessage);
    }

    function sendRegistrationMessage() {
      view.contentWindow.postMessage("register.chrome.app.window", "*");
      view.removeEventListener("loadstop", sendRegistrationMessage);
      view.removeEventListener("load", sendRegistrationMessage);
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
