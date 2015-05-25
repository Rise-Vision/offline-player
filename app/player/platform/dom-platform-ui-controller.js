module.exports = {
  createElement: document.createElement.bind(document),
  setElementHeight: function(el, height) {
    el.style.height = height + "px";
  },
  setElementWidth: function(el, width) {
    el.style.width = width + "px";
  },
  setVisibility: function(el, vis) {
    return vis ? el.style.display = "block" : el.style.display = "none";
  },
  appendChild: function(el, child) {
    el.appendChild(child);
  },
  removeChild: function(el, child) {
    el.removeChild(child);
  },
  getPrimaryElement: function() {return document.body;},
  requestElementPointerLock: function(el) {el.requestPointerLock();},
  getUIHeight: function() {return document.body.clientHeight;},
  getUIWidth: function() {return document.body.clientWidth;}
};
