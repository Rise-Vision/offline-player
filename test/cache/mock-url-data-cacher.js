"use strict";
var riseUrl = "risemedialibrary-323232323232323232323232323232323232/1/tst.html",
urlHashes = {};
urlHashes[riseUrl] = "hashtest1";
urlHashes.test = "hashtest2";

module.exports = {
  setSchedule: function() {},
  getUrlHashes: function() {return urlHashes;},
  fetchUrlDataIntoFilesystem: function() {}
};
