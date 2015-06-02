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
        var view = platformUIController.createViewWindow();
        platformUIController.setPersistence(view, item.name);
        platformUIController.setViewContent(view, item.objectReference);
        contentViews.push(view);
        platformUIController.addView(view);
        platformUIController.registerChromeAppWindow(view);
      });

      return contentViews;
    },

    showView: function(item) {
      platformUIController.setVisibility(contentViews[item], true);
      platformUIController.requestElementPointerLock(contentViews[item]);
      return true;
    },

    hideView: function(item) {
      platformUIController.setVisibility(contentViews[item], false);
      return true;
    }
  };
}

module.exports = contentViewControllerFactory;
