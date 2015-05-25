(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function claimIdClickListener(controller) {
  return function() {
    controller.setUIValues({
      claimId: document.getElementById("claimId").value,
      displayName: document.getElementById("displayName").value
    });

    controller.verifyOnline(navigator.onLine)
    .then(function registerWithClaimId() {
      return fetch(controller.assembleRegistrationUrl());
    })
    .then(function processCoreResponse(resp) {
      return resp.json();
    })
    .then(controller.setDisplayIdFromJson)
    .then(function sendPlatformDetails() {
      return fetch(controller.assemblePlatformDetailsUrl(),
      {credentials: "include"});
    })
    .then(null, function(err) {
      controller.setUIStatus({message: "Error applying claim id. " + err, severity: "severe"});
    });
  };
}

module.exports = claimIdClickListener;

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
function displayIdClickListener(controller) {
  return function() {
    var id = document.getElementById("displayId").value;

    fetch(controller.assemblePlatformDetailsUrl(id), {credentials: "include"})
    .then(function() {
      return fetch(controller.assembleDisplayNameFetchUrl(id));
    })
    .then(function(resp) {
      return resp.json();
    })
    .then(function(resp) {
      if (!resp.item || !resp.item.displayName) {
        throw new Error("invalid response");
      }

      controller.setUIValues({
        displayName: resp.item.displayName,
        displayId: id
      });
    })
    .then(null, function(err) {
      controller.setUIStatus({message: "Error applying display id.", severity: "warning"});
    });
  };
}

module.exports = displayIdClickListener;

},{}],4:[function(require,module,exports){
function optionsPageController(coreUrls) {
  "use strict";
  var uiFieldMap = {displayId: "", claimId: "", displayName: ""},
  dimensions = {width: 0, height: 0},
  uiStatus = {color: "", message: ""};

  return {
    verifyOnline: function(online) {
      if (!online) {
        return Promise.reject(new Error("Not online"));
      }

      return Promise.resolve(true);
    },

    setDisplayIdFromJson: function(json) {
      if (!json.displayId) {
        return Promise.reject(new Error("Invalid json response"));
      }

      uiFieldMap.displayId = json.displayId;
      return Promise.resolve(json.displayId);
    },

    assembleRegistrationUrl: function() {
      return coreUrls.registrationUrl
      .replace("CLAIM_ID", uiFieldMap.claimId)
      .replace("WIDTH", dimensions.width)
      .replace("NAME", uiFieldMap.displayName)
      .replace("HEIGHT", dimensions.height);
    },

    assembleDisplayNameFetchUrl: function(id) {
      id = id || uiFieldMap.displayId;
      return coreUrls.displayNameFetchUrl.replace("DISPLAY_ID", id);
    },

    assemblePlatformDetailsUrl: function(id) {
      id = id || uiFieldMap.displayId;
      return coreUrls.setPlatformDetailsUrl.replace("DISPLAY_ID", id);
    },

    setUIValues: function(valuesObj) {
      for (var prop in valuesObj) {
        uiFieldMap[prop] = valuesObj[prop];
      }
    },

    getUIValues: function() { return uiFieldMap; },

    setUIStatus: function(status) {
      uiStatus.severity = status.severity; uiStatus.message = status.message;
    },

    setDimensions: function(dim) {
      dimensions.width = dim.width; dimensions.height = dim.height;
    },

    setUIFieldMapObserver: function(fn) {
      Object.observe(uiFieldMap, fn);
    },

    setUIStatusObserver: function(fn) {
      Object.observe(uiStatus, fn);
    }
  };
}

module.exports = optionsPageController;

},{}],5:[function(require,module,exports){
function updateStatusFieldUI(evt) {
  var el = document.getElementById("status"),
  changes = evt.detail;

  el.innerHTML = changes[changes.length - 1].object.message;
  el.style.display = "block";
  el.style.backgroundColor = "Red";
}

module.exports = updateStatusFieldUI;

},{}],6:[function(require,module,exports){
window.addEventListener("load", function() {
  var coreUrls = require("./core-urls.js"),
  controller = require("./options-page-controller.js")(coreUrls);

  (function setOptionsWindowCloseTimeout() {
    var timeoutHandle;

    timeoutHandle = setTimeout(function() {window.close();}, 10000);

    document.addEventListener("click", function() {
      clearTimeout(timeoutHandle);
    });
  }());

  controller.setDimensions({width: screen.width, height: screen.height});

  (function restoreUIFields() {
    chrome.storage.local.get(Object.keys(controller.getUIValues()),
    controller.setUIValues);
  }());

  controller.setUIFieldMapObserver(function(changes) {
    var latestChanges = changes.pop().object;

    for (var elementId in latestChanges) {
      document.getElementById(elementId).value = latestChanges[elementId];
    }

    chrome.storage.local.set(latestChanges, function() {
      if (chrome.runtime.lastError) {
        controller.setUIStatus
        ({message: "Could not save info", severity: "severe"});
      }
    });
  });

  controller.setUIStatusObserver(function(changes) {
    document.getElementById("status").dispatchEvent
    (new CustomEvent("status.update", {detail: changes}));
  });

  (function bindDomInputListeners() {
    addListener("close", "click", function() {window.close();});
    addListener("displayIdApply", "click", require("./display-id-click-listener.js")(controller));
    addListener("claimIdApply", "click", require("./claim-id-click-listener.js")(controller));
    addListener("status", "status.update", require("./status-field-listener.js"));

    function addListener(id, evt, fn) {
      document.getElementById(id).addEventListener("click", fn);
    }
  }());
});

},{"./claim-id-click-listener.js":1,"./core-urls.js":2,"./display-id-click-listener.js":3,"./options-page-controller.js":4,"./status-field-listener.js":5}]},{},[6]);
