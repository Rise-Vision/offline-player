module.exports = function(platformUIController, platformIOProvider) {
  "use strict";
  var contentViews = {};

  function removePreviousContentViews() {
    Object.keys(contentViews).forEach(function(key) {
      platformUIController.removeView(contentViews[key]);
    });

    contentViews = {};
    return contentViews;
  }

  function isRiseStorage(url) {
    return /risemedialibrary-.{36}\//.test(url);
  }

  return {
    createContentViews: function(items) {
      removePreviousContentViews();
      return Promise.all(items.map(function(item) {
        return new Promise(function(resolve, reject) {
          if (!isRiseStorage(item.objectReference)) {
            resolve({url: item.objectReference});
          } else {
      console.log(platformIOProvider.hash);
            resolve(platformIOProvider.filesystemRetrieve
            (platformIOProvider.hash(item.objectReference) + ".html"));
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
};
