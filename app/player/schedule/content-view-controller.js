function contentViewControllerFactory(platformUIController) {
  "use strict";
  var contentViews = [];

  function removePreviousContentViews() {
    contentViews.forEach(function(item) {
      platformUIController.removeChild(platformUIController.getPrimaryElement(), item);
    });

    contentViews = [];
    return contentViews;
  }

  return {
    createContentViews: function(items) {
      removePreviousContentViews();

      items.forEach(function(item) {
        if (item.type === "url") {
          var wv = platformUIController.createElement("webview");
          platformUIController.setElementHeight(wv, platformUIController.getUIHeight());
          platformUIController.setElementWidth(wv, platformUIController.getUIWidth());
          platformUIController.setVisibility(wv, false);
          wv.partition = "persist:" + item.name;
          wv.src = item.objectReference;

          contentViews.push(wv);
          platformUIController.appendChild(platformUIController.getPrimaryElement(), wv);
        }
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
