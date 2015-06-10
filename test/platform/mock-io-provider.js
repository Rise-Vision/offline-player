module.exports = function(mockScenario) {
  "use strict";

  var calledParams = {}, errorState = false;

  if (!mockScenario) {mockScenario = {};}

  mockScenario = {
    disconnected: mockScenario.disconnected ?
    mockScenario.disconnected : false,

    failedLocalStorageSet: mockScenario.failedLocalStorageSet ?
    mockScenario.failedLocalStorageSet : false,

    fetchContent: mockScenario.fetchContent ? mockScenario.fetchContent : {
      content: {schedule: {}}
    } 
  };

  return {
    httpFetcher: function(param) {
      calledParams.httpFetcher = param;
      return Promise.resolve({
        json: function() {return mockScenario.fetchContent;}
      });
    },
    localStorage: {
      set: function(target, cb){
        if (mockScenario.failedLocalStorageSet) {
          errorState = true;
        }
        return cb({});},
      get: function(target, cb){
        calledParams.localStorageGet = target;
        return cb({displayId: "testId"});
      }
    },
    hasErrorState: function() {return errorState;},
    isNetworkConnected: function() {return !mockScenario.disconnected;},
    getCalledParams: function() {return calledParams;}
  };
};
