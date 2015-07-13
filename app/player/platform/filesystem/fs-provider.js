var fs,
crypto = require("crypto");

(function initFilesystemPromise() {
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

function hash(str) {
  var sha1sum = crypto.createHash('sha1');
  sha1sum.update(str);
  return sha1sum.digest("hex");
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
  hasFilesystemSpace: function() {
    return checkFilesystemSpace(0);
  },
  filesystemSave: function(mainUrlPath, filePath, fileBlob) {
    var fileName;
    filePath = filePath.split("/");
    fileName = filePath.pop();

    if (typeof fileBlob === "string") {
      fileBlob = new Blob([blob]);
    }

    return checkFilesystemSpace(fileBlob.size)
    .then(function() {
      filePath.unshift(hash(mainUrlPath));
      return getDirectory(filePath);
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

    function getDirectory(directoryPathArray) {
      return fs.then(function(fs) {
        return directoryPathArray.reduce(function(prev, curr) {
          return prev.then(function(dir) {
            return new Promise(function(resolve, reject) {
              dir.getDirectory(curr, {create:true}, function(nextDir) {
                resolve(nextDir);
              });
            });
          });
        }, Promise.resolve(fs.root));
      });
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
  }
};
