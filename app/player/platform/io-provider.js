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
    return;// Promise.reject("Player is in offline mode");
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
  //return navigator.onLine;
  return false;
}

module.exports = function(serviceUrls) {
  return {
    httpFetcher: fetch.bind(window),
    getRemoteFolderItemsList: function(targetFileUrl) {
      var regex = /risemedialibrary-(.{36})\/(.*)/;
      var match = regex.exec(targetFileUrl);
      if(!match || match.length !== 3) {
        return Promise.reject("Invalid URL");
      }

      var companyId = match[1];
      var folder = match[2].indexOf("/") >= 0 ? 
      match[2].substr(0, match[2].lastIndexOf("/") + 1) :
      ""; 

      var listingUrl = serviceUrls.folderContentsUrl
      .replace("COMPANY_ID", companyId)
      .replace("FOLDER_NAME", encodeURIComponent(folder));

      return fetch(listingUrl)
      .then(function(resp) {
        return resp.json();
      })
      .then(function(json) {
        var filteredItems = json.items.filter(function(f) {
          return f.folder === false;
        });

        return Promise.resolve(filteredItems.map(function(f) {
          return  {
            remoteUrl: f.mediaLink,
            filePath: f.objectId.substr(folder.length),
            etag: f.etag
          };
        }));
      });
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

      return fs.then(function(fs) {
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
    getCachedMainUrl: function(url) {
      var mainUrlPath = url.substr(0, url.lastIndexOf("/") + 1),
      fileName = url.substr(url.lastIndexOf("/") + 1);

      return fs.then(function(fs) {
        return fs.root.toURL() + hash(mainUrlPath) + "/" + fileName;
      });
    },
    isNetworkConnected: isNetworkConnected,
    registerTargets: function(targets, reset) {
      return registerTargets(serviceUrls.registerTargetUrl, targets, reset);
    }
  };
};
