"use strict";
var assert = require("assert"),
handlerPath = "../../../app/player/platform/content-event-handlers/storage-component-load.js",
simple = require("simple-mock"),
mock = simple.mock,
stub = simple.stub,
mockPlatformIO,
mockUIController,
mockLocalObjectStore,
responseHandler;

describe("storage-component-load", function() {
  var companyId = "23b0d348-9147-4527-825a-6dec36b602c2";
  var eventObject, testUrl, testData, fetchResponse, storedData;

  beforeEach("setup mocks", function() {
    testUrl = "http://testurl";
    eventObject = {
      data: {
        type: "storage-component-load",
        url: testUrl
      }
    };

    // This module does not care about the content of the response, so any JSON will do
    testData = {
      name: "test"
    };

    fetchResponse = {
      json: function() {
        return testData;
      }
    };

    storedData = { storageComponentData: {} };
    storedData.storageComponentData[testUrl] = testData;

    mockPlatformIO = {};
    mockUIController = {};
    mockLocalObjectStore = {};
    mockPlatformIO.localObjectStore = mockLocalObjectStore;
    mock(mockPlatformIO, "httpFetcher").resolveWith(fetchResponse);
    mock(mockPlatformIO, "isNetworkConnected").returnWith(true);
    mock(mockUIController, "sendWindowMessage").returnWith(true);
    mock(mockLocalObjectStore, "get").resolveWith(storedData);
    mock(mockLocalObjectStore, "set").resolveWith(storedData);
    
    responseHandler = require(handlerPath)(mockPlatformIO, mockUIController);
  });

  it("exists", function() {
    assert.ok(responseHandler);
  });

  it("handles its event", function() {
    assert.ok(responseHandler.handles(eventObject));
  });

  it("rejects invalid invocations", function(done) {
    var eventObject = {
      data: {type: "storage-component-load"}
    };

    responseHandler.process(eventObject).then(null, function(err) {
      assert.equal(err.name, "Error");
      done();
    });
  });

  it("fetches the remote file listing when online", function(done) {
    responseHandler.process(eventObject).then(function() {
      assert.equal(mockPlatformIO.httpFetcher.callCount, 1);
      assert.equal(mockPlatformIO.httpFetcher.lastCall.args[0], testUrl);
      done();
    });
  });

  it("stores fetch response when online", function(done) {
    responseHandler.process(eventObject).then(function() {
      assert.equal(mockLocalObjectStore.set.callCount, 1);
      assert.equal(mockLocalObjectStore.set.lastCall.args[0].storageComponentData[testUrl].name,
        storedData.storageComponentData[testUrl].name);
      done();
    });
  });

  it("restores the file list from local storage when offline", function(done) {
    mock(mockPlatformIO, "isNetworkConnected").returnWith(false);

    responseHandler.process(eventObject).then(function() {
      assert.equal(mockPlatformIO.httpFetcher.callCount, 0);
      assert.equal(mockLocalObjectStore.get.callCount, 1);
      done();
    });
  });

  it("sends processed response", function(done) {
    responseHandler.process(eventObject).then(function() {
      var arg1 = mockUIController.sendWindowMessage.lastCall.args[1];

      assert.equal(mockUIController.sendWindowMessage.callCount, 1);
      assert.equal(arg1.response.name, testData.name);
      done();
    });
  });

  it("sends failed response", function(done) {
    mock(mockPlatformIO, "httpFetcher").rejectWith("error");

    responseHandler.process(eventObject).then(function() {
      var arg1 = mockUIController.sendWindowMessage.lastCall.args[1];

      assert.equal(mockUIController.sendWindowMessage.callCount, 1);
      assert.equal(arg1.error, "Failed to fetch data");
      done();
    });
  });
});
