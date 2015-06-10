module.exports = {
  createViewWindow: function() {
    var view =  document.createElement("webview");
    view.style.height = document.body.clientHeight + "px";
    view.style.width = document.body.clientWidth + "px";
    view.style.display = "none";
    return view;
  },

  setVisibility: function(el, vis) {
    return vis ? el.style.display = "block" : el.style.display = "none";
  },

  setPersistence: function(el, name) {
    el.partition = "persist:" + name;
  },

  setViewContent(el, target) {
    el.src = target;
  },

  addView: function(view) {document.body.appendChild(view);},
  removeView: function(view) {document.body.removeChild(view);},
  requestElementPointerLock: function(el) {el.requestPointerLock();},
  registerChromeAppWindow: function(el) {
    el.addEventListener("contentload", function() {
      el.contentWindow.postMessage("register.chrome.app.window", "*");
    });
  }
};
