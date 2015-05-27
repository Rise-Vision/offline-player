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
  createViewWindow: function() {
    var view =  document.createElement("webview");
    view.style.height = document.body.clientHeight + "px";
    view.style.width = document.body.clientWidth + "px";
    view.style.display = "none";
    return view;
  },

  setVisibility: function(el, vis) {
    return vis ? el.style.display = "block" : el.style.display = "none";
  },

  setPersistence: function(el, name) {
    el.partition = "persist:" + name;
  },

  setViewContent(el, target) {
    el.src = target;
  },

  addView: function(view) {document.body.appendChild(view);},
  removeView: function(view) {document.body.removeChild(view);},
  requestElementPointerLock: function(el) {el.requestPointerLock();}
};

},{}],3:[function(require,module,exports){
function contentViewControllerFactory(platformUIController) {
  "use strict";
  var contentViews = [];

  function removePreviousContentViews() {
    contentViews.forEach(function(item) {
      platformUIController.removeView(item);
    });

    contentViews = [];
    return contentViews;
  }

  return {
    createContentViews: function(items) {
      removePreviousContentViews();

      items.forEach(function(item) {
        var view = platformUIController.createViewWindow();
        platformUIController.setPersistence(view, item.name);
        platformUIController.setViewContent(view, item.objectReference);
        contentViews.push(view);
        platformUIController.addView(view);
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
module.exports = function localScheduleLoader(timelineParser) {
  "use strict";
  var emptySchedule = require("./empty-schedule.js");

  return new Promise(function(resolve, reject) {
    chrome.storage.local.get(["schedule"], function(storageObject) {
      var schedule = storageObject.schedule;
      if (chrome.runtime.lastError) {
        return reject(new Error("error retrieving local schedule"));
      }

      if (!schedule || !schedule.hasOwnProperty("items")) {
        console.info("Local schedule loader: invalid schedule format");
        return resolve(emptySchedule);
      }

      if (!isPlayable(schedule)) {
        console.info("Local schedule loader: schedule timeline is not met");
        console.info(JSON.stringify(schedule));
        return resolve(emptySchedule);
      }

      console.log("item count: " + schedule.items.length);
      schedule.items = schedule.items.filter(isUrlType).filter(isPlayable);
      console.info(JSON.stringify(schedule.items));

      if (schedule.items.length === 0) {
        console.info("Local schedule loader: schedule is empty");
        return resolve(emptySchedule);
      }

      resolve(schedule);
    });
  });

  function isUrlType(item) {return item.type === "url";}

  function isPlayable(item) {
    console.info("checking playability for " + item.name);

    try {
      timelineParser.isPlayable(item, new Date());
    } catch(e) {
      console.info("Local schedule loader: " + item.name + " not playable - " + e.message);
      return false;
    }
    console.log(item.name + " is playable");
    return true;
  }
};


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
      console.info(JSON.stringify(json));
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
function scheduleHandler(contentViewController) {
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

module.exports = scheduleHandler;

},{}],8:[function(require,module,exports){
function timelineParser() {
  "use strict";
  var startTime, compareTime, endTime, timeline, compareDate, recurrenceFrequency, recurrenceType, startDate, endDate,
  checkRecurrence = {
    "Daily": checkDailyRecurrence,
    "Weekly": checkWeeklyRecurrence,
    "Monthly": checkMonthlyRecurrence,
    "Yearly": checkYearlyRecurrence
  };

  return {
    isPlayable: function(timelineObject, compareTo) {
      if (!timelineObject) {err("no timeline");}
      timeline = timelineObject;

      compareDate = compareTo ? getDateComponent(compareTo) : getDateComponent(new Date());
      compareTime = getTimeComponent(compareTo);

      startTime = timeline.startTime ? getTimeComponent(timeline.startTime) : 0;
      endTime = timeline.endTime ? getTimeComponent(timeline.endTime) : 0;

      startDate = getDateComponent(timelineObject.startDate);
      endDate = getDateComponent(timelineObject.endDate);

      recurrenceFrequency = timeline.recurrenceFrequency;
      if (recurrenceFrequency < 1) {recurrenceFrequency = 1;}

      checkStartEndDateRange();
      checkStartEndTimeRange();

      if (checkRecurrence.hasOwnProperty(timeline.recurrenceType)) {
        checkRecurrence[timeline.recurrenceType]();
      }

      return true;
    }
  };

  function err(msg) {throw new Error(msg); }

  function checkStartEndDateRange() {
    if (!timeline.hasOwnProperty("startDate")) {return true; }
    if (startDate > compareDate) {err("before start"); }
    if (!timeline.endDate) {return true;}
    if (endDate < compareDate) {err("after end"); }
  }

  function checkStartEndTimeRange() {
    if (!timeline.hasOwnProperty("timeDefined")) {err("time defined"); }
    if (timeline.timeDefined === false || timeline.timeDefined === "false") {return true; }
    if (startTime === 0 && endTime === 0) {return true;}

    if (playsOvernight()) {
      if (compareTime < startTime && compareTime > endTime) {
        err("play at night");
      }
    } else {
      if (compareTime < startTime || compareTime > endTime) {
        err("play during day");
      }
    }
  }

  function checkDailyRecurrence() {
    if (timeline.recurrenceType != "Daily") {return true;}
    if (daysPassed() % recurrenceFrequency !== 0) {err("wrong day frequency");}
  }

  function checkWeeklyRecurrence() {
    if (timeline.recurrenceType != "Weekly") { return true; }
    if (weeksPassed() % recurrenceFrequency !==0) {err("wrong weekly frequency");}
    if (!playsThisWeekday()) {err("wrong weekday");}
  }

  function checkMonthlyRecurrence() {
    if (timeline.recurrenceType != "Monthly") { return true; }
    if (monthsPassed() % recurrenceFrequency !==0) {err("wrong monthly frequency") ;}

    if (timeline.recurrenceAbsolute) {
      if (timeline.recurrenceDayOfMonth !== compareDate.getDate()) {err("wrong day of month");}
    } else {
      if (timeline.recurrenceDayOfWeek !== compareDate.getDay()) {err("wrong day of week");}
      if (timeline.recurrenceWeekOfMonth === 4) {
        if (compareDate.getDate() <= (daysInMonth(compareDate) - 7)) {err("not last week of month");}
      } else {
        if ((timeline.recurrenceWeekOfMonth !== (parseInt((compareDate.getDate() - 1) / 7, 10)))) {err("wrong week of month");}
      }
    }
  }

  function checkYearlyRecurrence() {
    if (timeline.recurrenceType != "Yearly") { return true; }
    if (timeline.recurrenceMonthOfYear !== compareDate.getMonth()) {err("wrong month of year");}

    if (timeline.recurrenceAbsolute) {
      if (timeline.recurrenceDayOfMonth !== compareDate.getDate()) {err("wrong day of month");}
    } else {
      if (compareDate.getDay() !== timeline.recurrenceDayOfWeek) {err("wrong day of week");}
      if (compareDate.getDate() < (timeline.recurrenceWeekOfMonth * 7) || compareDate.getDate() > timeline.recurrenceWeekOfMonth * 7 + 7) {err("wrong week of month");}
    }
  }

  function daysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  function monthsPassed() {
    return ((compareDate.getFullYear() - startDate.getFullYear()) * 12) +
    compareDate.getMonth() - startDate.getMonth();
  }

  function playsOvernight() {
    return startTime > endTime;
  }

  function getTimeComponent(dateText) {
    var date = new Date(dateText);
    return (date.getHours() * 60 * 60) +
           (date.getMinutes() * 60) +
           (date.getSeconds());
  }

  function getDateComponent(dateText) {
    var date = new Date(dateText);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function daysPassed() {
    return (compareDate - startDate) / (1000 * 60 * 60 * 24);
  }

  function weeksPassed() {
    return parseInt(daysPassed() / 7, 10);
  }

  function playsThisWeekday() {
    if (!timeline.recurrenceDaysOfWeek) { return false;}
    if (!Array.isArray(timeline.recurrenceDaysOfWeek)) { return false;}

    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return timeline.recurrenceDaysOfWeek.some(function(item) {
      return item === days[compareDate.getDay()];
    });
  }
}

module.exports = timelineParser;

},{}],9:[function(require,module,exports){
(function() {
  "use strict";
  var contentViewController = require("./content-view-controller.js")
  (require("../platform/dom-platform-ui-controller.js")),

  localScheduleLoader = require("./local-schedule-loader.js"),

  timelineParser = require("./timeline-parser.js")(),

  remoteScheduleLoad = require("./remote-schedule-retriever.js"),

  scheduleHandler = require("./schedule-handler.js")
  (contentViewController);

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
        reloadLocalSchedule();
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
  reloadLocalSchedule();

  function reloadLocalSchedule() {
    localScheduleLoader(timelineParser)
    .then(function(scheduleData) {
      scheduleHandler.setScheduleData(scheduleData);

      scheduleHandler.cycleViews
      (contentViewController.createContentViews(scheduleData.items));
    });
  }
}());

},{"../platform/dom-platform-ui-controller.js":2,"./content-view-controller.js":3,"./local-schedule-loader.js":5,"./remote-schedule-retriever.js":6,"./schedule-handler.js":7,"./timeline-parser.js":8}]},{},[9]);
