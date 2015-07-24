module.exports = function(cache, platformIO, serviceUrls) {
  function saveFolderItems(mainUrlPath, items) {
    return items.reduce(function(prev, curr) {
      return prev.then(function() {
        return platformIO.httpFetcher(curr.remoteUrl)
        .then(function(resp) {
          if (resp.status === 403) {
            throw new Error("blocked");
          }
          return resp.blob();
        })
        .then(function(blob) {
          return cache.cacheFileFromUrl(mainUrlPath, curr.filePath, blob);
        }).
        catch(function(err) {
          logger.console("Blocked file: " + curr.remoteUrl);
          logger.external("file blocked");
        });
      });
    }, Promise.resolve());
  }

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

    return platformIO.httpFetcher(listingUrl)
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
    fetchFilesIntoFilesystem: function(mainUrlPath, files) {
      return saveFolderItems(mainUrlPath, files);
    },
    fetchFoldersIntoFilesystem: function(scheduleItems) {
      if (!platformIO.isNetworkConnected()) {
        return Promise.resolve(false);
      }

      return Promise.all(scheduleItems.map(function(scheduleItem) {
        var url = scheduleItem.objectReference,
        mainUrlPath = url.substr(0, url.lastIndexOf("/") + 1);

        return checkItemConditions()
        .then(function() {
          return getRemoteFolderItemsList(url);
        })
        .then(function(items) {
          return saveFolderItems(mainUrlPath, items);
        })
        .catch(function(err) {
          var msg = "Remote folder fetcher: Not retrieving folder " +
          "contents for " + url;
          console.log(msg + "\n  -" + err.message, err);
        });

        function checkItemConditions() {
          if (!/risemedialibrary-.{36}\//.test(url)) {
            return Promise.reject
            (new Error("not a Rise Storage folder"));
          }

          return cache.hasPreviouslySavedSchedule(mainUrlPath)
          .then(function(exists) {
            if (exists) {
              throw new Error("folder exists");
            }
          });
        }
      }));
    }
  };
};
