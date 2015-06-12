var fs;

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

module.exports = {
  localStorageObjectGet: function(itemArray) {
    return new Promise(function(resolve, reject) {
      chrome.storage.local.get(itemArray, function(items) {
        if (chrome.runtime.lastError) {return reject(chrome.runtime.lastError);}
        resolve(items);
      });
    });
  },
  httpFetcher: fetch,
  hasErrorState: function() {return chrome.runtime.lastError;},
  isNetworkConnected: function() {return navigator.onLine;},
  filesystemSave: function(hash, blob) {
    return fs.then(function(fs) {
      return new Promise(function(resolve, reject) {
        fs.root.getFile(hash, {create: true}, function(entry) {
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
  filesystemRetrieve: function(hash) {
    return fs.then(function(fs) {
      return new Promise(function(resolve, reject) {
        fs.root.getFile(hash, {}, function(entry) {
          entry.file(function(file) {
            resolve(file);
          }, function(err) {reject(err);});
        }, function(err) {reject(err);});
      });
    });
  }
};
