function contentViewControllerFactory(document) {
  "use strict";
  var contentViews = [];

  return {
    createContentViews: function(items) {
      items.forEach(function(item) {
        if (item.type === "url") {
          var wv = document.createElement("webview");
          wv.style.height = document.body.clientHeight + "px";
          wv.style.width = document.body.clientWidth + "px";
          wv.style.display = "none";
          wv.partition = "persist:" + item.name;
          wv.src = item.objectReference;

          contentViews.push(wv);
          document.body.appendChild(wv);
        }
      });

      return contentViews;
    },

    removeContentViews: function() {
      contentViews.forEach(function(item) {
        document.body.removeChild(item);
      });

      contentViews = [];
      return true;
    },

    showView: function(item) {
      contentViews[item].style.display = "block";
      contentViews[item].requestPointerLock();
    },

    hideView: function(item) {
      contentViews[item].style.display = "none";
    }
  };
}

module.exports = contentViewControllerFactory;
