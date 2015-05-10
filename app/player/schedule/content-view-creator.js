"use strict";

$rv.contentViewCreator = (function() {
  var contentViews = [];

  return {
    createContentViews(items) {
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

    removeContentViews() {
      contentViews.forEach(function(item) {
        document.body.removeChild(item);
      });

      contentViews = [];
    }
  };
}());
