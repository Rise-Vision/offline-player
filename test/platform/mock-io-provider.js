"use strict";
var crypto = require("crypto"); 

module.exports = function(mockScenario) {
  var calledParams = {
    httpFetcher: [],
    getRemoteFolderItemsList: [],
    filesystemSave: [],
    filesystemRetrieve: [],
    localStorage: {}
  };

  if (!mockScenario) {mockScenario = {};}
  if (!mockScenario.failedLocalStorage) {mockScenario.failedLocalStorage = {};}

  mockScenario = {
    disconnected: mockScenario.disconnected ?
    mockScenario.disconnected : false,

    failedLocalStorage: {
      get: mockScenario.failedLocalStorage.get ?
      mockScenario.failedLocalStorage.get : false,

      set: mockScenario.failedLocalStorage.set ?
      mockScenario.failedLocalStorage.set : false,

      emptyGet: mockScenario.failedLocalStorage.emptyGet ?
      mockScenario.failedLocalStorage.emptyGet: false
    },

    failedFilesystemSave: mockScenario.failedFilesystemSave ?
    mockScenario.failedFilesystemSave : false,

    fetchContent: mockScenario.fetchContent ? mockScenario.fetchContent : {
      content: {schedule: {}}
    } 
  };

  function localStorage(getOrSet, itemArray) {
    var retval = {};
    if (getOrSet === "get") {
      itemArray.forEach(function(item) {retval[item] = "mock-result";});
    }

    calledParams.localStorage[getOrSet] = itemArray;

    if (mockScenario.failedLocalStorage[getOrSet]) {
      return Promise.reject(new Error("failed local object " + getOrSet));
    }
    if (mockScenario.failedLocalStorage.emptyGet === true) {
      return Promise.resolve({});
    }
    return Promise.resolve(retval);
  }

  return {
    httpFetcher: function(param) {
      calledParams.httpFetcher.push(param);
      return Promise.resolve({
        json: function() {return Promise.resolve(mockScenario.fetchContent);},
        blob: function() {return Promise.resolve("mock-blob");}
      });
    },
    getRemoteFolderItemsList: function(url) {
      calledParams.getRemoteFolderItemsList.push(url);
      return Promise.resolve([
          {url: "url1", filePath: "filePath1"},
          {url: "url2", filePath: "filePath2"},
          {url: "url3", filePath: "filePath3"}
      ]);
    },
    localObjectStore: {
      get: function(itemArray) {return localStorage("get", itemArray);},
      set: function(itemArray) {return localStorage("set", itemArray);}
    },
    filesystemSave: function(fileName, blob) {
      calledParams.filesystemSave.push([fileName, blob]);
      if (mockScenario.failedFilesystemSave) {
        return Promise.reject("Failed filesystem save");
      }
      return Promise.resolve(true);
    },
    filesystemRetrieve: function(fileName) {
      calledParams.filesystemRetrieve.push(fileName);
      return Promise.resolve(true);
    },
    isNetworkConnected: function() {return !mockScenario.disconnected;},
    hash: function(str) {
      var sha1sum = crypto.createHash('sha1');
      sha1sum.update(str);
      return sha1sum.digest("hex");
    },
    getCalledParams: function() {return calledParams;}
  };
};