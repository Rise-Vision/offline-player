"use strict";

var assert = require("assert"),
mock = require("simple-mock").mock,
retrieverPath = "../../app/player/schedule/remote-schedule-retriever.js",
retriever,
platformIO,
coreUrl = {scheduleFetchUrl: "test"};

describe("remote schedule retriever", function(){
  beforeEach("set up mock IO scenario", function() {
    platformIO = {localObjectStore: {}};
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

  it("rejects when disconnected", function() {
    mock(platformIO, "isNetworkConnected", function() {return false;});
    retriever = require(retrieverPath)(platformIO, coreUrl);

    return retriever.loadRemoteSchedule()
    .then(function(resp) {
      assert.fail("Should not be here");
    })
    .catch(function(resp) {
      assert.ok(/no connection/.test(resp));
    });
  });

  it("rejects when local storage retrieval fails", function() {
    retriever = require(retrieverPath)(platformIO, coreUrl);
    mock(platformIO.localObjectStore, "get", function() {
      return Promise.resolve();
    });

    return retriever.loadRemoteSchedule()
    .then(function(resp) {
      assert.fail(resp, "rejection", "expected rejected promise");
    })
    .catch(function(err) {
      assert.ok(err.message.indexOf("error retrieving display id") > - 1);
    });
  });

  it("rejects when no display id is stored", function() {
    mock(platformIO.localObjectStore, "get", function() {
      return Promise.resolve({});
    });
    retriever = require(retrieverPath)(platformIO, coreUrl);

    return retriever.loadRemoteSchedule()
    .then(function(resp) {
      assert.fail(resp, "rejection", "expected rejected promise");
    })
    .catch(function(err) {
      assert.ok(err.message.indexOf("no display id") > -1);
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

  it("throws if no schedule in response", function() {
    mock(platformIO, "httpFetcher", function() {
      return Promise.resolve({json: function() {return Promise.resolve(
            {content: {noschedulehere: {}}}
      );}});
    });
    retriever = require(retrieverPath)(platformIO, coreUrl);

    return retriever.loadRemoteSchedule()
    .then(function() {
      assert.fail(null, null, "expected rejected promise");
    })
    .catch(function(resp) {
      assert(resp.message.indexOf("no schedule data") > -1);
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
      assert.fail(null, null, "received resolved promise on failed storage update");
    })
    .catch(function(err) {
      assert.ok(err.message.indexOf("error saving schedule") > -1);
    });
  });
});
