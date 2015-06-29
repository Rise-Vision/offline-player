var cheerio = require("cheerio"),
path = require("path");

module.exports = function(platformIO) {
  return {
    parseFiles: function() {
      var folderItems;

      return platformIO.localObjectStore.get(["folderItems"])
      .then(function(items) {
        if (!items.folderItems) {return;}
        folderItems = items.folderItems;
        return Promise.all(Object.keys(folderItems).map(mainUrlProcessor));
      });

      function mainUrlProcessor(mainUrlPath) {
        var filePaths = Object.keys(folderItems[mainUrlPath]).filter(function(key) {
          return /\.html$/.test(key);
        });

        return Promise.all
        (filePaths.map(createSaveItemFunction(mainUrlPath)))
        .then(function() {
          return Promise.all
          (filePaths.map(createParseItemFunction(mainUrlPath)));
        });
      }

      function createSaveItemFunction(mainUrlPath) {
        return function(filePath) {
          return platformIO.filesystemSave
          ("PARSED" + mainUrlPath + filePath, "to-be-parsed")
          .then(function(resp) {
            folderItems[mainUrlPath][filePath].localUrl = resp;
          });
        };
      }

      function createParseItemFunction(mainUrlPath) {
        return function(filePath) {
          return platformIO.filesystemRetrieve
          (mainUrlPath + filePath, {includeContents: true})
          .then(function(resp) {
            var $ = cheerio.load(resp.fileContentString);

            $("*[href]").attr("href", internalizeExternalReferences);
            $("*[src]").attr("src", internalizeExternalReferences);
            return platformIO.filesystemSave("PARSED" + mainUrlPath + filePath, $.html());
          });

          function internalizeExternalReferences(idx, extRef) {
            var filePathDir = path.dirname(filePath);
            if (filePathDir === ".") {filePathDir = "";}

            var storedEntry = folderItems[mainUrlPath][path.join(filePathDir, extRef)] || folderItems[extRef];
            if (storedEntry) {
              return storedEntry.localUrl;
            }

            return extRef;
          }
        };
      }
    }
  };
};
