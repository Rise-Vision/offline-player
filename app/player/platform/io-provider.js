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

module.exports = {
  httpFetcher: fetch.bind(window),
  getRemoteFolderItemsList: function(url) {
    var listingUrl = 

    return fetch(listingUrl)
    .then(function(resp) {
      return resp.json();
    })
    .then(function(json) {
      //process json to return an array of objects, one for each file path
      //{url: urlToFetchTheFile, filePath: theFilePath}

      //return Promise.resolve(pathObjects);
    });
  },
  localObjectStore: {
    get: function(itemArray) {return localStorage("get", itemArray);},
    set: function(itemArray) {return localStorage("set", itemArray);}
  },
  filesystemSave: function(fileName, blob) {
    return fs.then(function(fs) {
      return new Promise(function(resolve, reject) {
        fs.root.getFile(filename, {create: true}, function(entry) {
          entry.createWriter(function(writer) {
            writer.onwriteend = function() {
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
