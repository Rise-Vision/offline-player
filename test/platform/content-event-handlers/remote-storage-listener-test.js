/*
  it("fetches and updates previously saved remote folders", function() {
    mock(mockPlatformIO, "hasPreviouslySavedFolder").returnWith(true);
    mock(mockFolderFetcher, "fetchFoldersIntoFilesystem").resolveWith(true);
    mock(mockContentViewController, "reloadMatchingPresentations").resolveWith(true);
    mock(mockContentViewController, "getContentViews").returnWith({
      "view1": {
        creationTime: new Date().getTime() + 10000,
        contentWindow: {}
      }
    });

    gcmListener({
      data: {
        targets: JSON.stringify(["test/"])
      }
    }).then(function() {
      assert.equal(mockPlatformIO.hasPreviouslySavedFolder.callCount, 2);
      assert.equal(mockFolderFetcher.fetchFoldersIntoFilesystem.callCount, 2);
      assert.equal(mockContentViewController.reloadMatchingPresentations.callCount, 2);
      assert.equal(mockContentViewController.getContentViews.callCount, 1);
      
      assert.equal(mockUIController.sendWindowMessage.lastCall.args[1].targets[0], "test/");
    });
  });

  it("does not fetch not existing folders", function() {
    mock(mockPlatformIO, "hasPreviouslySavedFolder").returnWith(false);
    mock(mockFolderFetcher, "fetchFoldersIntoFilesystem").resolveWith(true);
    mock(mockContentViewController, "reloadMatchingPresentations").resolveWith(true);
    mock(mockContentViewController, "getContentViews").returnWith({
      "view1": {
        creationTime: new Date().getTime() + 10000,
        contentWindow: {}
      }
    });

    gcmListener({
      data: {
        targets: JSON.stringify(["test/"])
      }
    }).then(function() {
      assert.equal(mockPlatformIO.hasPreviouslySavedFolder.callCount, 2);
      assert.equal(mockFolderFetcher.fetchFoldersIntoFilesystem.callCount, 0);
      assert.equal(mockContentViewController.reloadMatchingPresentations.callCount, 0);
      assert.equal(mockContentViewController.getContentViews.callCount, 1);
      
      assert.equal(mockUIController.sendWindowMessage.lastCall.args[1].targets[0], "test/");
    });
  });
  */
