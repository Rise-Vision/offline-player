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
module.exports = {
  createElement: document.createElement.bind(document),
  setElementHeight: function(el, height) {
    el.style.height = height + "px";
  },
  setElementWidth: function(el, width) {
    el.style.width = width + "px";
  },
  setVisibility: function(el, vis) {
    return vis ? el.style.display = "block" : el.style.display = "none";
  },
  appendChild: function(el, child) {
    el.appendChild(child);
  },
  removeChild: function(el, child) {
    el.removeChild(child);
  },
  getPrimaryElement: function() {return document.body;},
  requestElementPointerLock: function(el) {el.requestPointerLock();},
  getUIHeight: function() {return document.body.clientHeight;},
  getUIWidth: function() {return document.body.clientWidth;}
};

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
 var emptySchedule = {
  "id":"nil",
  "companyId":"nil",
  "name":"Test",
  "changeDate":"07042015145536993",
  "transition":"",
  "scale":"",
  "position":"",
  "distribution":[  
    "default"
  ],
  "distributeToAll":false,
  "timeDefined":false,
  "recurrenceType":"Daily",
  "recurrenceFrequency":1,
  "recurrenceAbsolute":false,
  "recurrenceDayOfWeek":0,
  "recurrenceDayOfMonth":0,
  "recurrenceWeekOfMonth":0,
  "recurrenceMonthOfYear":0,
  "items":[  
    {  
      "name":"empty-schedule-screen",
      "duration":"5",
      "type":"url",
      "objectReference":"../../content/empty-schedule-screen/index.html",
      "distributeToAll":"true",
      "timeDefined":"false",
      "startDate":"04/07/15 9:55 AM",
      "endDate":null,
      "startTime":null,
      "endTime":null,
      "recurrenceType":"Daily",
      "recurrenceFrequency":"1",
      "recurrenceAbsolute":"true",
      "recurrenceDayOfWeek":"0",
      "recurrenceDayOfMonth":"0",
      "recurrenceWeekOfMonth":"0",
      "recurrenceMonthOfYear":"0"
    }
  ]
};

module.exports = emptySchedule;

},{}],5:[function(require,module,exports){
function localScheduleLoader() {
  "use strict";
  var emptySchedule = require("./empty-schedule.js");

  return new Promise(function(resolve, reject) {
    chrome.storage.local.get(["schedule"], function(storageObject) {
      var schedule = storageObject.schedule;
      if (chrome.runtime.lastError) {
        return reject(new Error("error retrieving local schedule"));
      }

      if (!schedule || !schedule.hasOwnProperty("items") ||
      schedule.items.length === 0 ||
      !schedule.items.some(isUrlType)) {
        console.info("Local schedule loader: schedule is invalid");
        return resolve(emptySchedule);
      }

      schedule.items = schedule.items.filter(isUrlType);
      resolve(schedule);
    });
  });
}

function isUrlType(item) {return item.type === "url";}
module.exports = localScheduleLoader;

},{"./empty-schedule.js":4}],6:[function(require,module,exports){
function remoteScheduleLoad() {
  "use strict";
  var url = require("../options/core-urls.js").scheduleFetchUrl;

  if (!navigator.onLine) {return;}

  new Promise(function(resolve, reject) {
    chrome.storage.local.get(["displayId"], function(item) {
      if (chrome.runtime.lastError || !item.displayId) {
        return reject(new Error("Remote schedule retriever: error retrieving display id from local storage"));
      }

      resolve(item.displayId);
    });
  })
  .then(function(id) {
    console.log("Remote schedule retriever: retrieval for: " + id);
    return fetch(url.replace("DISPLAY_ID", id), {credentials: "include"});
  })
  .then(function(resp) {
    return resp.json();
  })
  .then(function(json) {
    if (!json.content || !json.content.schedule) {
      throw new Error("Remote schedule retriever: no schedule data in response");
    }
    return json.content.schedule;
  })
  .then(function(schedule) {
    return new Promise(saveLocalSchedule(schedule));
  })
  .then(null, function(err) {
    console.error(err);
  });


  function saveLocalSchedule(schedule) {
    return function saveLocalSchedule(resolve, reject) {
      chrome.storage.local.set({schedule: schedule}, function() {
        if (chrome.runtime.lastError) {
          return reject(new Error("Remote schedule retriever: error saving schedule"));
        }
        console.log("Remote schedule retriever: saved schedule");
        resolve();
      });
    };
  }
}

module.exports = remoteScheduleLoad;

},{"../options/core-urls.js":1}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
(function() {
  "use strict";
  var contentViewController = require("./content-view-controller.js")(require("../platform/dom-platform-ui-controller.js")),
  localScheduleLoader = require("./local-schedule-loader.js"),
  remoteScheduleLoad = require("./remote-schedule-retriever.js"),
  scheduleHandler = require("./schedule-handler.js")(contentViewController);

  chrome.alarms.create("load.remote.schedule", {periodInMinutes: 1});

  chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === "load.remote.schedule") {
      console.log("loading remote schedule at " + Date.now());
      remoteScheduleLoad();
    }
  });

  chrome.storage.onChanged.addListener(function(changes) {
    if (changes.hasOwnProperty("schedule")) {
      if (!changes.schedule.oldValue ||
      (changes.schedule.oldValue.changeDate !== 
      changes.schedule.newValue.changeDate)) {
        console.log("local schedule changed - reloading content");
        reloadSchedule();
      }
    }

    if (changes.hasOwnProperty("displayId")) {
      if (!changes.displayId.oldValue ||
      (changes.displayId.oldValue !== changes.displayId.newValue)) {
        remoteScheduleLoad();
      }
    } 
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

},{"../platform/dom-platform-ui-controller.js":2,"./content-view-controller.js":3,"./local-schedule-loader.js":5,"./remote-schedule-retriever.js":6,"./schedule-handler.js":7}]},{},[8]);
