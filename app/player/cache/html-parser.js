cheerio = require("cheerio");
path = require("path");

module.exports = function(platformIO) {
  return {
    parseSavedHtmlFile: function(url, parentPath) {
      var mainUrlPath = url.substr(0, url.lastIndexOf("/") + 1),
      parentUrlPath = parentPath || mainUrlPath,
      folderItems;

      return platformIO.localObjectStore.get(["folderItems"])
      .then(function(items) {
        folderItems = items.folderItems[parentUrlPath];
      })
      .then(function() {
        return platformIO.filesystemRetrieve(url, {includeContents: true});
      })
      .then(function(resp) {
        var $ = cheerio.load(resp.fileContentString);

        $("*[href]").attr("href", internalizeExternalReferences);
        $("*[src]").attr("src", internalizeExternalReferences);

        return platformIO.filesystemSave("PARSED" + url, $.html());
      });

      function internalizeExternalReferences(idx, extRef) {
        var fullURL = path.join(mainUrlPath, extRef).replace(":/", "://");
        var relativeURL = fullURL.replace(parentUrlPath, "");
        var storedEntry = folderItems[relativeURL] || folderItems[extRef];

        if (storedEntry) {
          return storedEntry.localUrl;
        }

        return extRef;
      }
    },

    returnParsedHtmlFile: function(url, parentPath) {
      var mainUrlPath = url.substr(0, url.lastIndexOf("/") + 1),
      parentUrlPath = parentPath || mainUrlPath,
      folderItems,
      references = {};

      return platformIO.localObjectStore.get(["folderItems"])
      .then(function(items) {
        folderItems = items.folderItems[parentUrlPath];
      })
      .then(function() {
        return platformIO.filesystemRetrieve(url, {includeContents: true});
      })
      .then(function(resp) {
        var $ = cheerio.load(resp.fileContentString);

        $("*[href]").attr("href", extractExternalReferences);
        $("*[src]").attr("src", extractExternalReferences);

        return {
          content: resp.fileContentString, 
          references: references
        };
      });

      function extractExternalReferences(idx, extRef) {
        var fullURL = path.join(mainUrlPath, extRef).replace(":/", "://");
        var relativeURL = fullURL.replace(parentUrlPath, "");
        var storedEntry = folderItems[relativeURL];

        if(relativeURL.endsWith("html")) {
          references[extRef] = relativeURL;
        }

        return extRef;
      }
    }
  };
};
