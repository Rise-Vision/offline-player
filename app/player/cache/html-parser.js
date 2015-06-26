cheerio = require("cheerio");

module.exports = function(platformIO) {
  return {
    parseSavedHtmlFile: function(url) {
      var mainUrlPath = url.substr(0, url.lastIndexOf("/") + 1),
      folderItems;

      return platformIO.localObjectStore.get(["folderItems"])
      .then(function(items) {
        folderItems = items.folderItems[mainUrlPath];
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
        var storedEntry = folderItems[mainUrlPath + extRef] || folderItems[extRef];
        if (storedEntry) {
          return storedEntry.localUrl;
        }

        return extRef;
      }
    }
  };
};
