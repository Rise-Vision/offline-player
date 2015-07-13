module.exports = function(platformUIController, platformIO, platformFS) {
  "use strict";
  var contentViews = {};

  function removeContentView(key) {
    platformUIController.removeView(contentViews[key]);
    delete contentViews[key];

    return contentViews;
  }

  function removePreviousContentViews() {
    Object.keys(contentViews).forEach(function(key) {
      platformUIController.removeView(contentViews[key]);
    });

    contentViews = {};
    return contentViews;
  }

  function createContentView(objectReference) {
    var visible = false;

    return new Promise(function(resolve, reject) {
      if (platformIO.isNetworkConnected() || !isRiseStorage(objectReference)) {
        resolve(objectReference);
      } else {
        resolve(platformFS.getCachedMainUrl(objectReference));
      }
    })
    .then(function(target) {
      if (contentViews[objectReference]) {
        visible = platformUIController.isVisible(contentViews[objectReference]);
        removeContentView(objectReference);
      }

      return platformUIController.createViewWindow(target);
    })
    .then(function(view) {
      if (view) {
        contentViews[objectReference] = view;
        platformUIController.setVisibility(contentViews[objectReference], visible);
      }
    });
  }

  function isRiseStorage(url) {
    return /risemedialibrary-.{36}\//.test(url);
  }

  return {
    getViewUrl: function(view) {
      for(var key in contentViews) {
        if(contentViews[key].contentWindow == view) {
          return key;
        }
      }

      return null;
    },

    createContentViews: function(items) {
      removePreviousContentViews();
      return Promise.all(items.map(function(item) {
        return createContentView(item.objectReference);
      }))
      .then(function() {
        return contentViews;
      });
    },

    reloadMatchingPresentations: function(mainUrlPath) {
      return Object.keys(contentViews).reduce(function(prev, key) {
        return prev.then(function(resp) {
          if(key.indexOf(mainUrlPath) >= 0) {
            return createContentView(key)
            .then(function() {resp.push(key); return resp;});
          }
          else {
            return resp;
          }
        });
      }, Promise.resolve([]));
    },

    showView: function(objectReference) {
      platformUIController.setVisibility(contentViews[objectReference], true);
      return true;
    },

    hideView: function(objectReference) {
      platformUIController.setVisibility(contentViews[objectReference], false);
      return true;
    },

    getContentViews: function() {
      return contentViews;
    }
  };
};
