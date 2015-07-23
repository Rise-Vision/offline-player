"use strict";
var assert = require("assert"),
mock = require("simple-mock").mock,
mockPlatformIO = {localObjectStore: {}},
cache = {},
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

listener = require("../../app/player/remote-storage/remote-storage-listener.js")
(mockPlatformIO, cache, mockViewController, mockUIController, mockFolderFetcher);

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
    mock(cache, "hasPreviouslySavedSchedule").resolveWith(true);

    return listener({data: {targets: JSON.stringify(["test/"])}})
    .then(function() {
      assert.equal(cache.hasPreviouslySavedSchedule.callCount, 2);
      assert.equal(mockFolderFetcher.fetchFoldersIntoFilesystem.callCount, 2);
      assert.equal(mockViewController.reloadMatchingPresentations.callCount, 2);
      assert.equal(mockViewController.getContentViews.callCount, 1);
      
      assert.equal(mockUIController.sendWindowMessage.lastCall.args[1].targets[0], "test/");
    });
  });

  it("does not fetch not existing folders", function() {
    mock(cache, "hasPreviouslySavedSchedule").resolveWith(false);

    return listener({data: {targets: JSON.stringify(["test/"])}})
    .then(function() {
      assert.equal(cache.hasPreviouslySavedSchedule.callCount, 2);
      assert.equal(mockFolderFetcher.fetchFoldersIntoFilesystem.callCount, 0);
      assert.equal(mockViewController.reloadMatchingPresentations.callCount, 0);
      assert.equal(mockViewController.getContentViews.callCount, 1);
      
      assert.equal(mockUIController.sendWindowMessage.lastCall.args[1].targets[0], "test/");
    });
  });
});

