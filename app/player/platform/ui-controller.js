module.exports = {
  createViewWindow: function(contentTarget) {
    var view =  document.createElement("webview");
    view.style.height = document.body.clientHeight + "px";
    view.style.width = document.body.clientWidth + "px";
    view.style.display = "none";
    view.partition = "persist:" + 
    (contentTarget.indexOf("../") === 0 ? "packaged" : contentTarget);
    view.src = contentTarget;
    document.body.appendChild(view);

    view.addEventListener("contentload", function() {
      view.contentWindow.postMessage("register.chrome.app.window", "*");
    });

    return view;
  },

  attachExternalFetchListener: function(listener) {
    view.request.onBeforeRequest(listener, {urls: ["<all_urls>"]}, ["blocking"]);
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
