module.exports = function(platformFS, platformIO) {
  var crypto = require("crypto");

  function hash(str) {
    var sha1sum = crypto.createHash('sha1');
    sha1sum.update(str);
    return sha1sum.digest("hex");
  }

  function hashAllCurrentScheduleItems() {
    var hashes = [];
    return new Promise(function(resolve, reject) {
      return platformIO.localObjectStore.get(["schedule"])
      .then(function(storageItems) {
        if (storageItems.schedule) {
          storageItems.schedule.items.forEach(function(item) {
            var url = item.objectReference;
            hashes.push(hash(url.substr(0, url.lastIndexOf("/") + 1)));
          });
        }
        resolve(hashes);
      });
    });
  }

  function deleteUnusedPresentations() {
    return platformFS.getRootDirectories()
    .then(function(dirs) {
      return hashAllCurrentScheduleItems()
      .then(function(activeScheduleDirs) {
        var inactiveDirs = dirs.filter(function(dir) {
          return activeScheduleDirs.indexOf(dir.name) === -1;
        });
        return platformFS.removeDirectories(inactiveDirs);
      });
    });
  }

  return {
    cacheFileFromUrl: function(mainUrlPath, filePath, fileData) {
      var fileName, mainUrlHash;
      filePathArray = filePath.split("/");
      fileName = filePathArray.pop();
      mainUrlHash = hash(mainUrlPath);

      return platformFS.checkFilesystemSpace(fileData.size)
      .catch(function cleaFilesystemSpace() {
        return deleteUnusedPresentations()
        .then(function() {return platformFS.checkFilesystemSpace(fileData.size);});
      })
      .then(function() {
        filePathArray.unshift(mainUrlHash);
        return platformFS.filesystemSave(filePathArray, fileName, fileData);
      })
      .catch(function(err) {
        console.log("Could not cache file. " + err.message);
      });
    },
    hasPreviouslySavedSchedule: function(mainUrlPath) {
      return platformFS.getDirectory(hash(mainUrlPath))
      .then(function(dir) {return dir !== false;});
    },
    getCachedMainScheduleObjectUrl: function(url) {
      var mainUrlPath = url.substr(0, url.lastIndexOf("/") + 1),
      fileName = url.substr(url.lastIndexOf("/") + 1);

      return platformFS.getMainFilesystemUrl()
      .then(function(url) {
        return url + hash(mainUrlPath) + "/" + fileName;
      });
    }
  };
};
