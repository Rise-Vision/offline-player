"use strict";
module.exports = {
  createViewWindow: function() {return {};},
  setVisibility: function(el, vis) {
    el.visibility = vis;
  },
  removeView: function(view) {
    view.removedChildCount += 1;
  },
};
