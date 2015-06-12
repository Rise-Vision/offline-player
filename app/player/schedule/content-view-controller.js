function contentViewControllerFactory(platformUIController) {
  "use strict";
  var contentViews = [];

  function removePreviousContentViews() {
    contentViews.forEach(function(item) {
      platformUIController.removeView(item);
    });

    contentViews = [];
    return contentViews;
  }

  return {
    createContentViews: function(items) {
      removePreviousContentViews();

      items.forEach(function(item) {
        var view = platformUIController.createViewWindow(item.objectReference);
        contentViews.push(view);
      });

      return contentViews;
    },

    showView: function(item) {
      platformUIController.setVisibility(contentViews[item], true);
      return true;
    },

    hideView: function(item) {
      platformUIController.setVisibility(contentViews[item], false);
      return true;
    }
  };
}

module.exports = contentViewControllerFactory;
