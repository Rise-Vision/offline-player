var fs;

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

function realizeDirectoryPath(directoryPathArray) {
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

module.exports = {
  checkFilesystemSpace: function(bytesToSave) {
    return new Promise(function(resolve, reject) {
      navigator.webkitPersistentStorage.queryUsageAndQuota
      (function(usedBytes, grantedBytes) {  
        if (grantedBytes - usedBytes - bytesToSave <= 0) {
          return reject(new Error("Insufficient disk space"));
        }
        resolve(grantedBytes - usedBytes);
      });
    });
  },
  getMainFilesystemUrl: function() {
    return fs
    .then(function(fs) {
      return fs.root.toURL();
    });
  },
  getDirectory: function(dir) {
    return fs.then(function(fs) {
      return new Promise(function(resolve, reject) {
        fs.root.getDirectory(dir, {create: false}, function(dir) {
          resolve(dir);
        }, function(err) {resolve(false);});
      });
    });
  },
  filesystemSave: function(filePathArray, fileName, fileData) {
    if (typeof fileData === "string") {
      fileData = new Blob([fileData]);
    }

    return realizeDirectoryPath(filePathArray)
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

            writer.write(fileData);
          }, errorFunction(reject));
        }, errorFunction(reject));
      });
    });

    function errorFunction(reject) {
      return function(err) {
        console.log("Platform FS: error on " + fileName + " " + err.message);
        reject(err);
      };
    }
  },
  removeDirectories: function(dirs) {
    return dirs.reduce(function(prev, curr) {
      return prev
      .then(function() {
        return new Promise(function(resolve, reject) {
          curr.removeRecursively(function() {
            resolve();
          }, function(err) {console.log(err); resolve();});
        });
      });
    }, Promise.resolve());
  },
  getRootDirectories: function() {
    return fs.then(function(fs) {
      var reader = fs.root.createReader(),
      dirs = [];
      return new Promise(function(resolve, reject) {
        function read() {
          reader.readEntries(function(entries) {
            if (!entries) {return resolve(dirs);}

            dirs = dirs.concat(entries.filter(function(entry){
              return entry.isDirectory;
            }));

            read();
          });
        }
      });
    });
  },
};
