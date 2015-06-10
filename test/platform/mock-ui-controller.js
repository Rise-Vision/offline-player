"use strict";
module.exports = {
  createViewWindow: function() {return {};},
  setVisibility: function(el, vis) {
    el.visibility = vis;
  },
  setPersistence: function() {},
  setViewContent: function(view, content) {},
  addView: function(view) {
    view.appendedChildCount += 1;
  },
  removeView: function(view) {
    view.removedChildCount += 1;
  },
  requestElementPointerLock: function(el) {el.pointerLocked = true;},
  registerChromeAppWindow: function(el) {},
};
