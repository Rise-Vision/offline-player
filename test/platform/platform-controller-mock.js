"use strict";
module.exports = {
  createElement: function() {return {};},
  setElementHeight: function(el, height) {
    el.height = height + "px";
  },
  setElementWidth: function(el, width) {
    el.width = width + "px";
  },
  setVisibility: function(el, vis) {
    el.visibility = vis;
  },
  appendChild: function(el, child) {
    el.appendedChildCount += 1;
  },
  removeChild: function(el, child) {
    el.removedChildCount += 1;
  },
  getPrimaryElement: function() {return {};},
  requestElementPointerLock: function(el) {el.pointerLocked = true;},
  getUIHeight: function() {return 10;},
  getUIWidth: function() {return 10;}
};
