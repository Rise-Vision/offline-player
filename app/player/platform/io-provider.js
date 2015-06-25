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
  var lastDot = require("url").parse(url).path.lastIndexOf("."), ext;

  ext = lastDot === -1 ? "" :
  url.substr(url.lastIndexOf("."));
  return ext;
}

function hash(str) {
  var sha1sum = crypto.createHash('sha1');
  sha1sum.update(str);
  return sha1sum.digest("hex");
}

function urlToFileName(url) {
  return hash(url) + getExt(url);
}

function IOProvider(serviceUrls) {
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
            filePath: f.objectId.substr(folder.length)
          };
        }));
      });
    },
    localObjectStore: {
      get: function(itemArray) {return localStorage("get", itemArray);},
      set: function(itemArray) {return localStorage("set", itemArray);}
    },
    filesystemSave: function(url, blob) {
      var fileName = urlToFileName(url);

      function errorFunction(reject) {
        return function(err) {
          console.log("Platform IO: error on " + fileName + " " + err.message);
          reject(err);
        };
      }

      return fs.then(function(fs) {
        return new Promise(function(resolve, reject) {
           fs.root.getFile(fileName, {create: false}, function(entry) {
             entry.remove(function() {
               resolve();
             });
           }, function() {resolve();});
        })
        .then(function() {
          return new Promise(function(resolve, reject) {
            fs.root.getFile(fileName, {create: true}, function(entry) {
              entry.createWriter(function(writer) {
                writer.onwriteend = function() {
                  entry.file(function(file) {
                    resolve(URL.createObjectURL(file));
                  }, errorFunction(reject));
                };

                writer.onerror = errorFunction(reject);

                writer.write(blob);
              }, errorFunction(reject));
            }, errorFunction(reject));
          });
        });
      });
    },
    filesystemRetrieve: function(url) {
      var fileName = urlToFileName(url);

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
  };
}

module.exports = IOProvider;
