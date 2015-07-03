module.exports = function(platformIO, serviceUrls) {
  function getRemoteFolderItemsList(targetFileUrl) {
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
  }

  return {
    fetchFoldersIntoFilesystem: function(scheduleItems) {
      if (!platformIO.isNetworkConnected()) {
        return Promise.reject(new Error("no network connection"));
      }

      return platformIO.hasFilesystemSpace()
      .then(function() {
        return Promise.all(scheduleItems.map(function(scheduleItem) {
          var url = scheduleItem.objectReference,
          mainUrlPath = url.substr(0, url.lastIndexOf("/") + 1);

          return checkItemConditions()
          .then(function() {
            return platformIO.getRemoteFolderItemsList(url);
          })
          .then(saveFolderItems)
          .catch(function(err) {
            var msg = "Remote folder fetcher: Not retrieving folder " +
            "contents for " + url;
            console.log(msg + "\n  -" + err.message);
          });

          function checkItemConditions() {
            if (!/risemedialibrary-.{36}\//.test(url)) {
              return Promise.reject
              (new Error("not a Rise Storage folder"));
            }

            return platformIO.hasPreviouslySavedFolder(mainUrlPath)
            .then(function(hasPreviouslySavedFolder) {
              if (hasPreviouslySavedFolder) {
                throw new Error("folder exists");
              }
            });
          }

          function saveFolderItems(items) {
            return items.reduce(function(prev, curr) {
              return prev.then(function() {
                return platformIO.httpFetcher(curr.remoteUrl)
                .then(function(resp) {
                  return resp.blob();
                })
                .then(function(blob) {
                  return platformIO.filesystemSave
                  (mainUrlPath, curr.filePath, blob); 
                });
              });
            }, Promise.resolve());
          }
        }));
      })
      .catch(function(err) {
        var msg = "Remote folder fetcher: Not retrieving any folder contents." +
        "\n -" + err.message;
        console.log(msg);
        return msg;
      });
    },
  };
};
