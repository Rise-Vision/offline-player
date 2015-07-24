"use strict";

var assert = require("assert"),
mock = require("simple-mock").mock,
retrieverPath = "../../app/player/schedule/remote-schedule-retriever.js",
retriever,
platformIO,
coreUrl = {scheduleFetchUrl: "test"};

describe("remote schedule retriever", function(){
  beforeEach("set up mock IO scenario", function() {
    global.logger = {};
    platformIO = {localObjectStore: {}};
    mock(global.logger, "console").returnWith(true);
    mock(global.logger, "external").returnWith(true);
    mock(platformIO, "isNetworkConnected").returnWith(true);
    mock(platformIO.localObjectStore, "get").resolveWith({displayId: "id"});
    mock(platformIO.localObjectStore, "set").resolveWith(true);
    mock(platformIO, "httpFetcher", function() {
      return Promise.resolve({json: function() {return Promise.resolve(
            {content: {schedule: {}}}
      );}});
    });
  });

  it("exists", function(){
    retriever = require(retrieverPath)(platformIO, coreUrl);
    assert.ok(retriever);
  });

  it("resolves false when disconnected", function() {
    mock(platformIO, "isNetworkConnected", function() {return false;});
    retriever = require(retrieverPath)(platformIO, coreUrl);

    return retriever.loadRemoteSchedule()
    .then(function(resp) {
      assert.equal(resp, false);
    });
  });

  it("doesn't save schedule when storage retrieval fails", function() {
    retriever = require(retrieverPath)(platformIO, coreUrl);
    mock(platformIO.localObjectStore, "get", function() {
      return Promise.resolve();
    });

    return retriever.loadRemoteSchedule()
    .then(function(resp) {
      assert.equal(platformIO.localObjectStore.set.callCount, 0);
    });
  });

  it("logs externally on invalid display id", function() {
    retriever = require(retrieverPath)(platformIO, coreUrl);
    mock(platformIO, "httpFetcher", function() {
      return Promise.resolve({json: function() {
        return Promise.resolve({
          status: {message: "display id not found"}
        });
      }});
    });

    return retriever.loadRemoteSchedule()
    .then(function() {
      assert.equal(logger.external.callCount, 1);
    });
  });

  it("doesn't try to fetch when displayId is not stored", function() {
    mock(platformIO.localObjectStore, "get", function() {
      return Promise.resolve({});
    });
    retriever = require(retrieverPath)(platformIO, coreUrl);

    return retriever.loadRemoteSchedule()
    .then(function(resp) {
      assert.equal(platformIO.httpFetcher.callCount, 0);
    });
  });

  it("retrieves displayId from local storage", function() {
    retriever = require(retrieverPath)(platformIO, coreUrl);

    return retriever.loadRemoteSchedule()
    .then(function(resp) {
      assert.equal(platformIO.localObjectStore.get.lastCall.args[0], "displayId");
    });
  });

  it("fetches remote schedule url", function() {
    retriever = require(retrieverPath)(platformIO, coreUrl);

    return retriever.loadRemoteSchedule()
    .then(function() {
      assert.equal(platformIO.httpFetcher.lastCall.args[0], "test");
    });
  });

  it("saves local schedule", function() {
    retriever = require(retrieverPath)(platformIO, coreUrl);

    return retriever.loadRemoteSchedule()
    .then(function(resp) {
      assert.equal(resp, true);
    });
  });

  it("rejects on local storage update failure", function() {
    mock(platformIO.localObjectStore, "set", function() {return Promise.reject();});
    retriever = require(retrieverPath)(platformIO, coreUrl);

    return retriever.loadRemoteSchedule()
    .then(function(resp) {
      assert.ok(/error saving/.test(global.logger.console.lastCall.args[0]));
    });
  });
});
