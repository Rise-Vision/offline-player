"use strict";
var assert = require("assert"),
mock = require("simple-mock").mock,
mockPlatformIO = {localObjectStore: {}},
mockPlatformFS = {},
mockViewController = {},
mockUIController = {},
mockFolderFetcher = {},
listener;

mock(mockPlatformIO.localObjectStore, "get").resolveWith(true);
mock(mockPlatformIO, "registerRemoteStorageId").returnWith(true);

mock(mockViewController, "reloadMatchingPresentations").resolveWith(["url"]);
mock(mockViewController, "getContentViews").returnWith({view1: {contentWindow:{}}});

mock(mockUIController, "sendWindowMessage").returnWith(true);

mock(mockFolderFetcher, "fetchFoldersIntoFilesystem").resolveWith(true);

listener = require("../../app/player/platform/remote-storage-listener.js")
(mockPlatformIO, mockPlatformFS, mockViewController, mockUIController, mockFolderFetcher);

describe("remote storage listener", function() {
  beforeEach(function resetSpys() {
    mockFolderFetcher.fetchFoldersIntoFilesystem.reset();
    mockViewController.reloadMatchingPresentations.reset();
    mockViewController.getContentViews.reset();
  });

  it("exists", function() {
    assert.ok(listener);
  });

  it("fetches and updates previously saved remote folders", function() {
    mock(mockPlatformFS, "hasPreviouslySavedFolder").resolveWith(true);

    return listener({data: {targets: JSON.stringify(["test/"])}})
    .then(function() {
      assert.equal(mockPlatformFS.hasPreviouslySavedFolder.callCount, 2);
      assert.equal(mockFolderFetcher.fetchFoldersIntoFilesystem.callCount, 2);
      assert.equal(mockViewController.reloadMatchingPresentations.callCount, 2);
      assert.equal(mockViewController.getContentViews.callCount, 1);
      
      assert.equal(mockUIController.sendWindowMessage.lastCall.args[1].targets[0], "test/");
    });
  });

  it("does not fetch not existing folders", function() {
    mock(mockPlatformFS, "hasPreviouslySavedFolder").resolveWith(false);

    return listener({data: {targets: JSON.stringify(["test/"])}})
    .then(function() {
      assert.equal(mockPlatformFS.hasPreviouslySavedFolder.callCount, 2);
      assert.equal(mockFolderFetcher.fetchFoldersIntoFilesystem.callCount, 0);
      assert.equal(mockViewController.reloadMatchingPresentations.callCount, 0);
      assert.equal(mockViewController.getContentViews.callCount, 1);
      
      assert.equal(mockUIController.sendWindowMessage.lastCall.args[1].targets[0], "test/");
    });
  });
});

