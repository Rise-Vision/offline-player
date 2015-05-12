(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
      return contentViews;
    },

    showView: function(item) {
      contentViews[item].style.display = "block";
      contentViews[item].requestPointerLock();
      return true;
    },

    hideView: function(item) {
      contentViews[item].style.display = "none";
      return true;
    }
  };
}

module.exports = contentViewControllerFactory;

},{}],2:[function(require,module,exports){
function localScheduleLoaderFactory(xhr) {
  "use strict";
  var schedulePath = "../schedule/default.json",
  resolveLoadSchedulePromise = null;

  function scheduleLoadedHandler() {
    resolveLoadSchedulePromise(xhr.response.content.schedule);
  }

  function setupXHR() {
    xhr.responseType = "json";
    xhr.addEventListener("load", function() {
      scheduleLoadedHandler();
    });
  }

  return {
    loadSchedule: function() {
      setupXHR();

      return new Promise(function(resolve) {
        xhr.open("GET", schedulePath);

        resolveLoadSchedulePromise = resolve;
        xhr.send();
      });
    }
  };
}

module.exports = localScheduleLoaderFactory;

},{}],3:[function(require,module,exports){
function scheduleHandlerFactory(contentViewController) {
  "use strict";
  var scheduleData = {},
  timeoutHandle = null;

  return {
    setScheduleData: function setScheduleData(newScheduleData) {
      scheduleData = newScheduleData;
    },

    getScheduleData: function getScheduleData() {
      return scheduleData;
    },

    cycleViews: function cycleViews() {
      clearTimeout(timeoutHandle);
      showItem(0);
    }
  };

  function showItem(item) {
    var duration = parseInt(scheduleData.items[item].duration, 10);

    contentViewController.showView(item);

    timeoutHandle = setTimeout(function() {
      showNextItem(item);
    }, duration * 1000);
  }

  function showNextItem(item) {
    contentViewController.hideView(item);

    item += 1;
    if (item === scheduleData.items.length) {
      item = 0;
    }

    showItem(item);
  }
}

module.exports = scheduleHandlerFactory;

},{}],4:[function(require,module,exports){
(function() {
  "use strict";
  var contentViewController = require("./content-view-controller.js")(document),
  localScheduleLoader = require("./local-schedule-loader.js")(new XMLHttpRequest()),
  scheduleHandler = require("./schedule-handler.js")(contentViewController);

  localScheduleLoader.loadSchedule().then(function(scheduleData) {
    scheduleHandler.setScheduleData(scheduleData);
    scheduleHandler.cycleViews
      (contentViewController.createContentViews(scheduleData.items));
  });
}());

},{"./content-view-controller.js":1,"./local-schedule-loader.js":2,"./schedule-handler.js":3}]},{},[4]);
