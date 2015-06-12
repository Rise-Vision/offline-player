function contentViewControllerFactory(platformUIController) {
  "use strict";
  var contentViews = {};

  function removePreviousContentViews() {
    Object.keys(contentViews).forEach(function(key) {
      platformUIController.removeView(contentViews[key]);
    });

    contentViews = {};
    return contentViews;
  }

  return {
    createContentViews: function(items) {
      removePreviousContentViews();

      items.forEach(function(item) {
        var view = platformUIController.createViewWindow(item.objectReference);
        contentViews[item.objectReference] = view;
      });

      return contentViews;
    },

    showView: function(objectReference) {
      platformUIController.setVisibility(contentViews[objectReference], true);
      return true;
    },

    hideView: function(objectReference) {
      platformUIController.setVisibility(contentViews[objectReference], false);
      return true;
    }
  };
}

module.exports = contentViewControllerFactory;
