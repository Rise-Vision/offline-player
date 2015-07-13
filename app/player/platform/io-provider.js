var fs,
crypto = require("crypto");

(function initFilesystem() {
  "use strict";
  fs = new Promise(function(resolve, reject) {
    webkitRequestFileSystem(PERSISTENT, 99000000000, function(fs) {
      resolve(fs);
    }, function(err) {
      console.log("IOProvider: could not initiate filesystem " + err);
      reject(rer);
    });
  });
}());

function localStorage(getOrSet, itemArray) {
  return new Promise(function(resolve, reject) {
    chrome.storage.local[getOrSet](itemArray, function(items) {
      if (chrome.runtime.lastError) {return reject(chrome.runtime.lastError);}
      resolve(items);
    });
  });
}

function registerTargets(registerTargetUrl, targets, reset) {
  if(!isNetworkConnected()) {
    return Promise.reject("Player is in offline mode");
  }

  var validTargets = targets.map(function(scheduleItem) {
    var url = scheduleItem.objectReference;
    console.log(url);
    return url.substr(0, url.lastIndexOf("/") + 1);
  }).filter(function(url) {
    return /risemedialibrary-.{36}\//.test(url);
  });

  console.log("targets: " + validTargets);
  
  return localStorage("get", ["gcmRegistrationId", "gcmTargets"]).then(function(storageItems) {
    var gcmRegistrationId = storageItems.gcmRegistrationId;
    var gcmTargets = storageItems.gcmTargets;

    if(gcmRegistrationId) {
      gcmTargets = reset ? [] : (storageItems.gcmTargets || []);

      validTargets.forEach(function(target) {
        gcmTargets.push(target);
      });

      return localStorage("set", { gcmTargets: gcmTargets }).then(function() {
        var targetParam = "".concat.apply("", gcmTargets.map(function(t) {
          return "&targets=" + encodeURIComponent(t.substr(t.indexOf("risemedialibrary-")));
        }));

        return fetch(registerTargetUrl.replace("GCM_CLIENT_ID", gcmRegistrationId) + targetParam, {
          mode: "no-cors"
        }).then(function(response) {
          return Promise.resolve(response);
        });
      });
    }
  });
}

function isNetworkConnected() {
  return navigator.onLine;
}

module.exports = {
  version: navigator.appVersion.match(/Chrome\/([0-9.]*)/)[1],
  name: "Chrome",
  baseName: "Offline Player",
  baseVersion: chrome.runtime.getManifest().version,
  basePlatform: navigator.platform.replace(" ", ""),
  httpFetcher: function(dest, opts) {
    if (!opts) {
      return fetch(dest);
    }

    setHeaders();
    return fetch(dest, opts);

    function setHeaders() {
      var headerArray = opts.headers,
      headers;

      if (!headerArray) {return;}

      headers = new Headers();

      headerArray.forEach(function(header) {
        var nameValue = header.split(":");
        headers.append(nameValue[0], nameValue[1].replace(" ", ""));
      });

      opts.headers = headers;
    }
  },
  localObjectStore: {
    get: function(itemArray) {return localStorage("get", itemArray);},
    set: function(itemArray) {return localStorage("set", itemArray);}
  },
  isNetworkConnected: function() {return navigator.onLine;},
  registerTargets: registerTargets,
  registerRemoteStorageId: function(id) {
    chrome.gcm.register([id], function(registrationId) {
      if (chrome.runtime.lastError) {
        console.log("Registration failed", chrome.runtime.lastError);
      }
      else {
        localStorage("set", { gcmRegistrationId: registrationId });
      }
    });
  },
  registerRemoteStorageListener: function(listener) {
    if(typeof(chrome) !== "undefined" && chrome.gcm) {
      chrome.gcm.onMessage.addListener(listener);
    }
  }
};
