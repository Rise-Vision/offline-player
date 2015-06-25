cheerio = require("cheerio");

module.exports = function(platformIO) {
  var folderItems;

  return {
    parseSavedHtmlFile: function(url) {
      var mainUrlPath = url.substr(0, url.lastIndexOf("/") + 1);

      return platformIO.localObjectStore.get(["folderItems"])
      .then(function(items) {
        folderItems = items.folderItems[mainUrlPath];
      })
      .then(function() {
        return platformIO.filesystemRetrieve(url);
      })
      .then(function(retrievedObject) {
        return retrievedObject.file;
      })
      .then(function(htmlText) {
        var $ = cheerio.load(htmlText);
        $("*[href]").attr("href", internalizeExternalReferences);
        $("*[src]").attr("src", internalizeExternalReferences);
        return platformIO.filesystemSave("PARSED"+url, $.html());
      });

      function internalizeExternalReferences(idx, extRef) {
        for (var i = 0; i < folderItems.length; i += 1) {
          if (folderItems[i].filePath === extRef ||
          folderItems[i].filePath === mainUrlPath + extRef) {
            return folderItems[i].localUrl;
          }
        }

        return extRef;
      }
    }
  };
};
