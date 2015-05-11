(function() {
  "use strict";
  var contentViewCreator = (function() {
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
            wv.showView = function() {
              wv.style.display = "block";
              wv.requestPointerLock();
            };

            wv.hideView = function() {
              wv.style.display = "none";
            };

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
      }
    };
  }());

  if (typeof window === "undefined") {
    module.exports = contentViewCreator;
  } else {
    $rv.contentViewCreator = contentViewCreator;
  }
}());
