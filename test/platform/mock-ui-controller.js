"use strict";
module.exports = {
  createViewWindow: function(url) {
    if (!url) {
      console.log("Mock UI Controller: no content target for view creation");
      return false;
    }

    return {src: url};
  },
  setVisibility: function(el, vis) {
    el.visibility = vis;
  },
  removeView: function(view) {
    view.removedChildCount += 1;
  },
};
