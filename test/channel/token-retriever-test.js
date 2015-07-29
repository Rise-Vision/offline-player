"use strict";
var assert = require("assert"),
serviceUrls = { tokenServerUrl: "testURL/DISPLAY_ID/channel?uid=UID&vv=VIEWER_VERSION" },
retrieverPath = "../../app/player/channel/token-retriever.js",
retriever,
mock = require("simple-mock").mock,
mockPlatformIO;

describe("token-retriever", function() {
  beforeEach("setup mocks", function() {
    global.logger = {};
    mock(global.logger, "console").returnWith(true);
    mock(global.logger, "external").returnWith(true);

    mockPlatformIO = { localObjectStore: {} };
    mock(mockPlatformIO.localObjectStore, "get").resolveWith({displayId: "test"});
    mock(mockPlatformIO, "isNetworkConnected").returnWith(true);
    mock(mockPlatformIO, "httpFetcher").resolveWith({
      json: function() {
        return Promise.resolve({token: "test-token"});
      }
    });

    retriever = require(retrieverPath)(mockPlatformIO, serviceUrls);
  });

  it("exists", function() {
    assert.ok(retriever);
  });

  it("does not generate a new uid if not requested", function() {
    var uid;

    return retriever.getToken()
    .then(function() {
      uid = retriever.getUID();
      assert(uid);
    })
    .then(retriever.getToken)
    .then(function() {
      assert(retriever.getUID());
      assert.equal(uid, retriever.getUID());
    });
  });

  it("generates a new uid when requested", function() {
    var uid;

    return retriever.getToken()
    .then(function() {
      uid = retriever.getUID();
      assert(uid);
    })
    .then(function() {
      return retriever.getToken(true);
    })
    .then(function() {
      assert(retriever.getUID());
      assert.notEqual(uid, retriever.getUID());
    });
  });

  it("generates the correct token request url", function() {
    var requestUrl;

    mockPlatformIO.httpFetcher = function(url) {
      requestUrl = url;

      return Promise.resolve({
        json: function() {
          return Promise.resolve({token: "test-token"});
        }
      });
    };

    return retriever.getToken()
    .then(function() {
      var viewerVersion = retriever.getViewerVersion();
      var uid = retriever.getUID();

      assert.equal(requestUrl, "testURL/test/channel?uid=" + uid + "&vv=" + viewerVersion);
    });
  });

  it("returns a valid token", function() {
    return retriever.getToken()
    .then(function(token) {
      assert(token);
      assert.equal(token, "test-token");
      
      assert(global.logger.external.called);
      assert.equal(global.logger.external.callCount, 1);
    });
  });

  it("rejects because a valid token could not be retrieved", function() {
    mock(mockPlatformIO, "httpFetcher").resolveWith({
      json: function() {
        return Promise.resolve({});
      }
    });

    return retriever.getToken()
    .then(null, function(err) {
      assert(err);
      assert.equal(err, "Invalid channel token - Null");

      assert(global.logger.external.called);
      assert.equal(global.logger.external.callCount, 1);
    });
  });
});
