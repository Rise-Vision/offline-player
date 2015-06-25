module.exports = function(platformUIController, platformIOProvider, htmlParser) {
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
            resolve(item.objectReference);
          } else {
            resolve(htmlParser.parseSavedHtmlFile(item.objectReference));
          }
        })
        .then(function(resp) {
          var view = platformUIController.createViewWindow(resp);
          if (view) {contentViews[item.objectReference] = view;}
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
