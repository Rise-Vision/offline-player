"use strict";
var crypto = require('crypto'); 

module.exports = function(mockScenario) {
  var calledParams = {
    httpFetcher: [],
    filesystemSave: [],
    filesystemRetrieve: []
  };

  if (!mockScenario) {mockScenario = {};}

  mockScenario = {
    disconnected: mockScenario.disconnected ?
    mockScenario.disconnected : false,

    failedLocalStorageSet: mockScenario.failedLocalStorageSet ?
    mockScenario.failedLocalStorageSet : false,

    failedFilesystemSave: mockScenario.failedFilesystemSave ?
    mockScenario.failedFilesystemSave : false,

    fetchContent: mockScenario.fetchContent ? mockScenario.fetchContent : {
      content: {schedule: {}}
    } 
  };

  return {
    httpFetcher: function(param) {
      calledParams.httpFetcher.push(param);
      return Promise.resolve({
        json: function() {return Promise.resolve(mockScenario.fetchContent);},
        blob: function() {return Promise.resolve("mock-blob");}
      });
    },
    localStorageObjectGet: function(itemArray) {
        calledParams.localStorageGet = itemArray;
        return Promise.resolve({displayId: "testId"});
    },
    localStorageObjectSet: function(itemArray) {
      calledParams.localStorageSet = itemArray;

      if (mockScenario.failedLocalStorageSet) {
        return Promise.reject(new Error("failed local object set"));
      }
      return Promise.resolve();
    },
    filesystemSave: function(hash, blob) {
      calledParams.filesystemSave.push([hash, blob]);
      if (mockScenario.failedFilesystemSave) {
        return console.log("Failed filesystem save");
      }
      return true;
    },
    filesystemRetrieve: function(hash) {
      calledParams.filesystemRetrieve.push(hash);
      return true;
    },
    isNetworkConnected: function() {return !mockScenario.disconnected;},
    getCalledParams: function() {return calledParams;},
    hash: function(str) {
      var sha1sum = crypto.createHash('sha1');
      sha1sum.update(str);
      return sha1sum.digest("hex");
    }
  };
};
