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

function IOProvider(serviceUrls) {
  return {
    httpFetcher: fetch.bind(window),
    getRemoteFolderItemsList: function(url) {
      var regex = /risemedialibrary-(.{36})\/(.*)/;
      var match = regex.exec(url);

      if(!match || match.length !== 3) {
        return Promise.reject("Invalid URL");
      }

      var companyId = match[1];
      var folder = match[2].indexOf("/") >= 0 ? match[2].substr(0, match[2].lastIndexOf("/") + 1) : ""; // Assumes a file will always be provided, not a folder

      var listingUrl = serviceUrls.folderContentsUrl.replace("COMPANY_ID", companyId).replace("FOLDER_NAME", encodeURIComponent(folder));

      return fetch(listingUrl)
      .then(function(resp) {
        return resp.json();
      })
      .then(function(json) {
        //process json to return an array of objects, one for each file path
        //{url: urlToFetchTheFile, filePath: theFilePath}

        return Promise.resolve(json.items.map(function(f) {
          return {
            url: f.mediaLink,
            filePath: f.objectId.substr(folder.length)
          };
        }));
      });
    },
    localObjectStore: {
      get: function(itemArray) {return localStorage("get", itemArray);},
      set: function(itemArray) {return localStorage("set", itemArray);}
    },
    filesystemSave: function(fileName, blob) {
      return fs.then(function(fs) {
        return new Promise(function(resolve, reject) {
          fs.root.getFile(fileName, {create: true}, function(entry) {
            entry.createWriter(function(writer) {
              writer.onwrite = function() {
                resolve();
              };

              writer.onerror = function(err) {
                reject(err);
              };

              writer.write(blob);
            }, function(err) {return reject(err);});
          }, function(err) {return reject(err);});
        });
      });
    },
    filesystemRetrieve: function(fileName) {
      return fs.then(function(fs) {
        return new Promise(function(resolve, reject) {
          fs.root.getFile(fileName, {}, function(entry) {
            entry.file(function(file) {
              resolve({url: URL.createObjectURL(file), file: file});
            }, function(err) {reject(err);});
          }, function(err) {reject(err);});
        });
      });
    },
    isNetworkConnected: function() {return navigator.onLine;},
    hash: function(str) {
      var sha1sum = crypto.createHash('sha1');
      sha1sum.update(str);
      return sha1sum.digest("hex");
    }
  };
}

module.exports = IOProvider;
