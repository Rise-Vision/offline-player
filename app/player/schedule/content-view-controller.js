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

      return Promise.all(items.map(function(item) {
        return new Promise(function(resolve, reject) {
          if (isLocalFile(item.objectReference)) {
            resolve({url: item.objectReference});
          } else {
            resolve(platformIOProvider.filesystemRetrieve
            (contentCache.getUrlHashes()[item.objectReference], "html"));
          }
        })
        .then(function(urlObject) {
          var view = platformUIController.createViewWindow(urlObject.url);
          contentViews[item.objectReference] = view;
        });
      }))
      .then(function() {
        return contentViews;
      });
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
