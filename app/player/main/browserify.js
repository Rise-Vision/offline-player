(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var coreUrls = {
  setPlatformDetailsUrl: "https://rvacore-test.appspot.com" +
  "/v2/viewer/display/DISPLAY_ID?os=" +
  navigator.platform.replace(" ", "/") +
  "&cv=" + navigator.appVersion.match(/Chrome\/([0-9.]*)/)[1] +
  "&cn=Chrome&pv=0.0.1&pn=OfflinePlayer",

  scheduleFetchUrl: "https://rvacore-test.appspot.com" +
  "/v2/viewer/display/DISPLAY_ID?nothing",

  displayNameFetchUrl: "https://rvacore-test.appspot.com/_ah/api/content/v0/display?id=DISPLAY_ID",

  registrationUrl: "https://rvacore-test.appspot.com" +
  "/v2/viewer/display/CLAIM_ID/register?" +
  "width=WIDTH&height=HEIGHT&name=NAME"
};

module.exports = coreUrls;

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
function localScheduleLoader() {
  "use strict";

  return new Promise(function(resolve, reject) {
    chrome.storage.local.get(["schedule"], function(schedule) {
      if (chrome.runtime.lastError) {
        return reject(new Error("error retrieving local schedule"));
      }

      if (!schedule.hasOwnProperty("items") || schedule.items.length === 0) {
        return resolve(require("empty-schedule.js"));
      }

      resolve(schedule);
    });
  });
}

module.exports = localScheduleLoader;

},{"empty-schedule.js":undefined}],4:[function(require,module,exports){
function remoteScheduleLoad() {
  "use strict";
  var url = require("../options/core-urls.js").scheduleFetchUrl;

  if (!navigator.onLine) {return;}

  new Promise(function(resolve, reject) {
    chrome.storage.local.get(["displayId"], function(item) {
      if (chrome.runtime.lastError) {
        return reject(new Error("error retrieving display id"));
      }

      if (!item.hasOwnProperty("displayId")) {return;}
      resolve(item.displayId);
    });
  })
  .then(function(id) {
    fetch(url.replace("DISPLAY_ID", id));
  })
  .then(function(resp) {
    return resp.json();
  })
  .then(function(json) {
    if (!json.content || !json.content.schedule) {
      return new Error("no schedule data");
    }

    return json.content.schedule;
  })
  .then(function(schedule) {
    return new Promise(function(resolve, reject) {
      chrome.storage.local.set({schedule: schedule}, function() {
        if (chrome.runtime.lastError) {
          return reject(new Error("error saving schedule"));
        }

        resolve();
      });
    });
  });
}

module.exports = remoteScheduleLoad;

},{"../options/core-urls.js":1}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
(function() {
  "use strict";
  var contentViewController = require("./content-view-controller.js")(document),
  localScheduleLoader = require("./local-schedule-loader.js"),
  remoteScheduleRetriever = require("./remote-schedule-retriever.js"),
  scheduleHandler = require("./schedule-handler.js")(contentViewController);

  chrome.alarms.create("load.remote.schedule", {periodInMinutes: 12});

  chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === "load.remote.schedule") {
      remoteScheduleLoad();
    }
  });

  chrome.storage.onChanged.addListener(function(changes) {
    var schedule;

    if (!changes.hasOwnProperty("schedule")) { return; }
    if (changes.schedule.oldValue.changeDate === 
        changes.schedule.newValue.changeDate)
    {return;}

    schedule = changes.schedule.newValue;

    reloadSchedule();
  });

  remoteScheduleLoad();
  reloadSchedule();

  function reloadSchedule() {
    localScheduleLoader().then(function(scheduleData) {
      scheduleHandler.setScheduleData(scheduleData);
      scheduleHandler.cycleViews
      (contentViewController.createContentViews(scheduleData.items));
    });
  }
}());

},{"./content-view-controller.js":2,"./local-schedule-loader.js":3,"./remote-schedule-retriever.js":4,"./schedule-handler.js":5}]},{},[6]);
