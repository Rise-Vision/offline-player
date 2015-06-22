"use strict";
module.exports = function() {
  var folderItems = {};

  return {
    fetchFoldersIntoFilesystem: function() {
    },

    getFolderItems: function() {
      return {
        "http://test/one/": [
          {filePath: "main.css", localUrl: "localUrl", file: "file"}
         ]
      };
    }
  };
};
