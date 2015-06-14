"use strict";
module.exports = {
  createViewWindow: function(url) {return {src: url};},
  setVisibility: function(el, vis) {
    el.visibility = vis;
  },
  removeView: function(view) {
    view.removedChildCount += 1;
  },
};
