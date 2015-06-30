module.exports = function(platformIO, htmlParser) {
  var folderItems = {};

  return {
    saveItemsList: function(urls) {
      var promises = [];

      urls.forEach(function(url) {
        var mainUrlPath = url.substr(0, url.lastIndexOf("/") + 1);
        var fileName = url.substr(url.lastIndexOf("/") + 1);

        folderItems[mainUrlPath] = folderItems[mainUrlPath] || {};

        if (/risemedialibrary-.{36}\//.test(url) && !folderItems[mainUrlPath][fileName]) {
          promises.push(platformIO.httpFetcher(url)
          .then(function(resp) {
            return resp.blob();
          })
          .then(function(blob) {
            return platformIO.filesystemSave(url, blob); 
          })
          .then(function(resp) {
            folderItems[mainUrlPath][fileName] = { localUrl: resp };
            return resp;
          }));
        }
        else if(folderItems[mainUrlPath][fileName]) {
          promises.push(Promise.resolve(folderItems[mainUrlPath][fileName].localUrl));
        }
        else {
          promises.push(Promise.resolve("not fetching unless Rise Storage file"));
        }
      });

      return Promise.all(promises);
    },

    fetchFoldersIntoFilesystem: function(scheduleItems) {
      return Promise.all(scheduleItems.map(function(scheduleItem) {
        var url = scheduleItem.objectReference,
        mainUrlPath = url.substr(0, url.lastIndexOf("/") + 1);

        if (!/risemedialibrary-.{36}\//.test(url)) {
          return Promise.resolve("not fetching unless Rise Storage folder");
        }

        if (!platformIO.isNetworkConnected()) {
          return refreshPreviouslySavedFolders(mainUrlPath)
          .then(function() {
            return platformIO.localObjectStore.set({folderItems: folderItems});
          });
        }

        return platformIO.getRemoteFolderItemsList(url)
        .then(function(items) {
          return saveFolderItems(items).then(function() {
            console.log("Returning from save folder items");
            return Promise.resolve(items);
          });
        })
        .then(function(items) {
          platformIO.localObjectStore.set({folderItems: folderItems});
          return Promise.resolve(items);
        })
        .then(parseHTMLPages)
        .then(function() {
          return platformIO.localObjectStore.set({folderItems: folderItems});
        })
        .catch(function(err) {
          var msg = "Remote folder fetcher: Could not retrieve folder " +
          "contents for " + url;
          console.log(msg + err, err);
        });

        function saveFolderItems(items) {
          folderItems[mainUrlPath] = {};
          return items.reduce(function(prev, curr) {
            return prev.then(function() {
              return platformIO.httpFetcher(curr.remoteUrl)
              .then(function(resp) {
                return resp.blob();
              })
              .then(function(blob) {
                return platformIO.filesystemSave(mainUrlPath + curr.filePath, blob); 
              })
              .then(function(resp) {
                folderItems[mainUrlPath][curr.filePath] = {localUrl: resp};
              });
            });
          }, Promise.resolve());
        }

        function parseHTMLPages(items) {
          var resolvedItems = [];
          var promises = [];

          // Load HTML files and extract their referenced HTML files
          items.forEach(function(item) {
            if(item.filePath.endsWith("html")) {
              promises.push(htmlParser.returnParsedHtmlFile(mainUrlPath + item.filePath, mainUrlPath).then(function(resp) {
                item.content = resp.content;
                item.references = resp.references;

                return Promise.resolve(item);
              }));
            }
          });

          // Sort files in a dependency based order. Files with no dependencies will go first.
          return Promise.all(promises).then(function(htmlItems) {
            var pendingItems = htmlItems.slice();
            var pendingMap = pendingItems.reduce(function(map, item) {
              map[item.filePath] = item; return map;
            }, {});

            while(pendingItems.length > 0) {
              var item = pendingItems.shift();
              var savedItem = folderItems[mainUrlPath][item.filePath];

              if(Object.keys(item.references).length === 0) {
                // If there are no references, the item is resolved
                item.resolved = true;
              }
              else {
                // Otherwise, check all other dependencies are resolved
                item.resolved = true;

                for(var key in item.references) {
                  if(pendingMap[item.references[key]]) {
                    item.resolved = item.resolved && pendingMap[item.references[key]].resolved;
                  }
                  else {
                    delete item.references[key];
                  }
                }
              }

              if(!item.resolved) {
                pendingItems.push(item);
              }
              else {
                resolvedItems.push(item);
              }
            }
          }).then(function() {
            // Save files in correct order
            return resolvedItems.reduce(function(prev, curr) {
              return prev.then(function() {
                var savedItem = folderItems[mainUrlPath][curr.filePath];

                return htmlParser.parseSavedHtmlFile(mainUrlPath + curr.filePath, mainUrlPath).then(function(resp) {
                  savedItem.localUrl = resp;

                  platformIO.localObjectStore.set({folderItems: folderItems});

                  return Promise.resolve(resp);
                });
              });
            }, Promise.resolve());            
          });
        }

        function refreshPreviouslySavedFolders(mainUrlPath) {
          return platformIO.localObjectStore.get(["folderItems"])
          .then(function(storageItems) {
            folderItems = storageItems.folderItems;
            return Promise.all
            (Object.keys(folderItems[mainUrlPath]).map(function(itemKey) {
              return platformIO.filesystemRetrieve(mainUrlPath + itemKey)
              .then(function(obj) {
                folderItems[mainUrlPath][itemKey] = {localUrl: obj.url};
              });
            }));
          })
          .catch(function(err) {
            console.log("Could not refresh previously saved folders");
            console.log(err);
          });
        }
      }));
    },

    getLocalPath: function(mainUrlPath, filePath) {
      return folderItems[mainUrlPath][filePath].localUrl;
    }
  };
};
