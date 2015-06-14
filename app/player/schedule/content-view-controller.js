function contentViewControllerFactory(platformUIController, contentCache, platformIOProvider) {
  "use strict";
  var contentViews = {};

  function removePreviousContentViews() {
    Object.keys(contentViews).forEach(function(key) {
      platformUIController.removeView(contentViews[key]);
    });

    contentViews = {};
    return contentViews;
  }

  function isLocalFile(url) {
    return url.indexOf("../") === 0;
  }

  return {
    createContentViews: function(items) {
      removePreviousContentViews();

      items.forEach(function(item) {
        var url, view;

        if (isLocalFile(item.objectReference)) {
          url = item.objectReference;
        } else {
          url = platformIOProvider.filesystemRetrieve
          (contentCache.getUrlHashes()[item.objectReference]).url;
        }
          
        view = platformUIController.createViewWindow(url);

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
