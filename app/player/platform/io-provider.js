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

function getExt(url) {
  var fileName = url.substr(url.lastIndexOf("/") + 1),
  lastDot = fileName.lastIndexOf(".");

  return lastDot === -1 ? "" : fileName.substr(lastDot);
}

function hash(str) {
  var sha1sum = crypto.createHash('sha1');
  sha1sum.update(str);
  return sha1sum.digest("hex");
}

function urlToFileName(url) {
  return hash(url) + getExt(url);
}

function registerTargets(registerTargetUrl, targets, reset) {
  if(!isNetworkConnected()) {
    return Promise.reject("Player is in offline mode");
  }
  
  return localStorage("get", ["gcmRegistrationId", "gcmTargets"]).then(function(storageItems) {
    var gcmRegistrationId = storageItems.gcmRegistrationId;
    var gcmTargets = storageItems.gcmTargets;

    if(gcmRegistrationId) {
      gcmTargets = reset ? [] : (storageItems.gcmTargets || []);

      targets.forEach(function(target) {
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

function checkFilesystemSpace(bytesToSave) {
  return new Promise(function(resolve, reject) {
    navigator.webkitPersistentStorage.queryUsageAndQuota
      (function(usedBytes, grantedBytes) {  
        if (grantedBytes - usedBytes - bytesToSave < 500000000) {
          return reject(new Error("Insufficient disk space"));
        }
        resolve(grantedBytes - usedBytes);
      });
  });
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
  filesystemSave: function(mainUrlPath, filePath, fileBlob) {
    var fileName;
    filePath = filePath.split("/");
    fileName = filePath.pop();

    if (typeof fileBlob === "string") {
      fileBlob = new Blob([blob]);
    }

    return checkFilesystemSpace(fileBlob.size)
    .then(function() {return fs;})
    .then(function(fs) {
      filePath.unshift(hash(mainUrlPath));
      return getDirectory(fs, filePath);
    })
    .then(function(directoryEntry) {
      return new Promise(function(resolve, reject) {
        directoryEntry.getFile(fileName, {create: true}, function(entry) {
          entry.createWriter(function(writer) {
            var truncated = false;

            writer.onwriteend = function() {
              if (!truncated) {
                truncated = true;
                return writer.truncate(writer.position);
              }

              entry.file(function(file) {
                resolve();
              }, errorFunction(reject));
            };

            writer.onerror = errorFunction(reject);

            writer.write(fileBlob);
          }, errorFunction(reject));
        }, errorFunction(reject));
      });
    });

    function getDirectory(fs, directoryPathArray) {
      return directoryPathArray.reduce(function(prev, curr) {
        return prev.then(function(dir) {
          return new Promise(function(resolve, reject) {
            dir.getDirectory(curr, {create:true}, function(nextDir) {
              resolve(nextDir);
            });
          });
        });
      }, Promise.resolve(fs.root));
    }

    function errorFunction(reject) {
      return function(err) {
        console.log("Platform IO: error on " + fileName + " " + err.message);
        reject(err);
      };
    }
  },
  hasPreviouslySavedFolder: function(mainUrlPath) {
    return fs.then(function(fs) {
      return new Promise(function(resolve, reject) {
        fs.root.getDirectory(hash(mainUrlPath), {create: false}, function(dir) {
          resolve(true);
        }, function(err) {resolve(false);});
      });
    });
  },
  getCachedMainUrl: function(url) {
    var mainUrlPath = url.substr(0, url.lastIndexOf("/") + 1),
    fileName = url.substr(url.lastIndexOf("/") + 1);

    return fs.then(function(fs) {
      return fs.root.toURL() + hash(mainUrlPath) + "/" + fileName;
    });
  },
  isNetworkConnected: function() {return navigator.onLine;},
  hasFilesystemSpace: function() {
    return checkFilesystemSpace(0);
  },
  registerTargets: registerTargets,
  registerGCMListener: function(listener) {
    if(typeof(chrome) !== "undefined" && chrome.gcm) {
      chrome.gcm.onMessage.addListener(listener);
    }
  }
};
