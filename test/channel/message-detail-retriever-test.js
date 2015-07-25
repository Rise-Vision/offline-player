"use strict";
var assert = require("assert"),
serviceUrls = { setPlatformDetailsUrl: "testURL/DISPLAY_ID?param1=value1" },
retrieverPath = "../../app/player/channel/message-detail-retriever.js",
retriever,
mock = require("simple-mock").mock,
response,
mockPlatformIO;

describe("message detail retriever", function() {
  beforeEach("setup mocks", function() {
    response = {
      status:{
        code: 0,
        message:"OK."
      },
      player:{
        updateRequired: "false",
        restartRequired:"false",
        rebootRequired:"false"
      },
      connection: {
        pingInterval: 15,
        pollInterval: 15,
        blockRemaining: 0
      }
    };

    global.logger = {};
    mock(global.logger, "console").returnWith(true);
    mock(global.logger, "external").returnWith(true);

    mockPlatformIO = { localObjectStore: {} };
    mock(mockPlatformIO.localObjectStore, "get").resolveWith({displayId: "test"});
    mock(mockPlatformIO, "isNetworkConnected").returnWith(true);

    retriever = require(retrieverPath)(mockPlatformIO, serviceUrls);
  });

  it("exists", function() {
    assert.ok(retriever);
  });

  it("generates the correct message detail request url", function() {
    var messageId = "test-ticket";
    var requestUrl;

    mockPlatformIO.httpFetcher = function(url) {
      requestUrl = url;

      return Promise.resolve({
        json: function() {
          return Promise.resolve({});
        }
      });
    };

    return retriever.getMessageDetail(messageId)
      .then(function() {
        assert.equal(requestUrl, "testURL/test?param1=value1&ticket=" + messageId);
      });
  });

  it("returns a valid response", function() {
    mock(mockPlatformIO, "httpFetcher")
      .resolveWith(Promise.resolve({
        json: function() {
          return response;
        }
      }));

    return retriever.getMessageDetail("test")
      .then(function(detail) {
        assert(detail);
        assert.equal(detail.status.message, "OK.");
      });
  });

  it("logs to external logger when fetch detail fails", function() {
    mock(mockPlatformIO, "httpFetcher").rejectWith(false);

    return retriever.getMessageDetail("test")
      .catch(function() {
        assert(global.logger.external.called);
        assert.equal(global.logger.external.callCount, 1);
      });
  });
});
