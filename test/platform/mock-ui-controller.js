"use strict";
module.exports = {
  createViewWindow: function(url) {
    return {src: url};
  },
  attachExternalFetchListener: function(view, listener) {
    view.attachedListener = listener;
  },
  setVisibility: function(el, vis) {
    el.visibility = vis;
  },
  removeView: function(view) {
    view.removedChildCount += 1;
  },
};
