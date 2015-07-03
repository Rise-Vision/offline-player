"use strict";
var assert = require("assert"),
handlerPath = "../../../app/player/platform/content-event-handlers/storage-component-response.js",
mock = require("simple-mock").mock,
mockPlatformIO = {},
isConnectedStub = mock(mockPlatformIO, "isNetworkConnected").returnWith(true),
registerTargetStub = mock(mockPlatformIO, "registerTargets").resolveWith(true),
mockUIController = {},
sendWindowMessageStub = mock(mockUIController, "sendWindowMessage")
.returnWith(true),
mockFolderFetcher = {},
fetchFilesStub = mock(mockFolderFetcher, "fetchFilesIntoFilesystem")
.resolveWith(true),

responseHandler = require(handlerPath)
(mockPlatformIO, mockFolderFetcher, mockUIController);

describe("storage-component-response", function() {
  it("exists", function() {
    assert.ok(responseHandler);
  });

  it("handles its event", function() {
    var eventObject = {
      data: {type: "storage-component-response"}
    };
    assert.ok(responseHandler.handles(eventObject));
  });
});
