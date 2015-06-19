module.exports = function() {
  var folderItems = {};

  return {
    fetchFoldersIntoFilesystem: function() {
    },

    getFolderItems: function() {
      return {
        "urlHash": [
          {url: "url", localUrl: "localUrl", file: "file"}
         ]
      };
    }
  };
}
