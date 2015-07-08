"use strict";
var assert = require("assert"),
serviceUrls = require("../../../test/main/mock-service-urls.js"),
handlerPath = "../../../app/player/platform/content-event-handlers/storage-component-response.js",
mock = require("simple-mock").mock,
mockPlatformIO,
mockUIController,
mockFolderFetcher,
responseHandler;

describe("storage-component-response", function() {
  var companyId = "23b0d348-9147-4527-825a-6dec36b602c2";
  var mainUrlPath = "https://storage.googleapis.com/risemedialibrary-" + companyId + "/wcrs/";
  var presentationUrl = mainUrlPath + "index.html";
  var imageName = "image.jpg";
  var imageSelfLink = mainUrlPath + imageName;
  var item, eventObject;

  beforeEach("setup mocks", function() {
    mockPlatformIO = {};
    mockUIController = {};
    mockFolderFetcher = {};
    mock(mockPlatformIO, "isNetworkConnected").returnWith(true);
    mock(mockPlatformIO, "registerTargets").resolveWith(true);
    mock(mockUIController, "sendWindowMessage").returnWith(true);
    mock(mockFolderFetcher, "fetchFilesIntoFilesystem").resolveWith(true);

    responseHandler = require(handlerPath)(serviceUrls, mockPlatformIO, mockFolderFetcher, mockUIController);

    item = {
      name: imageName,
      selfLink: imageSelfLink
    };
    eventObject = {
      data: {
        type: "storage-component-response",
        response: {
          files: [item]
       }
      }
    };
  });

  it("exists", function() {
    assert.ok(responseHandler);
  });

  it("handles its event", function() {
    var eventObject = {
      data: {type: "storage-component-response"}
    };
    assert.ok(responseHandler.handles(eventObject));
  });

  it("rejects invalid invocations", function(done) {
    var eventObject = {
      data: {type: "storage-component-response"}
    };

    responseHandler.process(eventObject, presentationUrl).then(null, function(err) {
      assert.equal(err.name, "Error");
      done();
    });
  });

  it("updates remote and local fields", function(done) {
    responseHandler.process(eventObject, presentationUrl).then(function() {
      assert.equal(item.filePath, "rise-storage-component-resources/" + companyId + "/" + item.name);
      assert.equal(item.remoteUrl, imageSelfLink + "?alt=media");
      done();
    });
  });

  it("uses remote url when running online", function(done) {
    responseHandler.process(eventObject, presentationUrl).then(function() {
      assert.equal(item.selfLink, imageSelfLink + "?alt=media");
      done();
    });
  });

  it("uses local url when running offline", function(done) {
  	mock(mockPlatformIO, "isNetworkConnected").returnWith(false);

    responseHandler.process(eventObject, presentationUrl).then(function() {
      assert.equal(item.selfLink, "rise-storage-component-resources/" + companyId + "/" + item.name);
      done();
    });
  });

  it("saves requested files into filesystem", function(done) {
    responseHandler.process(eventObject, presentationUrl).then(function() {
      assert.equal(mockFolderFetcher.fetchFilesIntoFilesystem.callCount, 1);
      done();
    });
  });

  it("does not save files into filesystem when running offline", function(done) {
  	mock(mockPlatformIO, "isNetworkConnected").returnWith(false);
  	
    responseHandler.process(eventObject, presentationUrl).then(function() {
      assert.equal(mockFolderFetcher.fetchFilesIntoFilesystem.callCount, 0);
      done();
    });
  });

  it("registers GCM targets", function(done) {
    responseHandler.process(eventObject, presentationUrl).then(function() {
      assert.equal(mockPlatformIO.registerTargets.callCount, 1);
      assert.equal(mockPlatformIO.registerTargets.lastCall.args[1][0].objectReference, mainUrlPath);
      done();
    });
  });

  it("notifies presentations about changes in targets", function(done) {
    responseHandler.process(eventObject, presentationUrl).then(function() {
      var arg1 = mockUIController.sendWindowMessage.lastCall.args[1];

      assert.equal(mockUIController.sendWindowMessage.callCount, 1);
      assert.equal(arg1.response.files[0].selfLink, imageSelfLink + "?alt=media");
      done();
    });
  });
});
