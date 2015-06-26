"use strict";

var assert = require("assert"),
retrieverPath = "../../app/player/schedule/remote-schedule-retriever.js",
mockIOProviderPath = "../platform/mock-io-provider.js",
mockIOScenario,
coreUrl = {scheduleFetchUrl: "test"};

describe("remote schedule retriever", function(){
  beforeEach("set up mock IO scenario", function() {
    mockIOScenario = {
      disconnected: false,
      failedLocalStorage: {},
      fetchContent: {content: {schedule: {}}}
    };
  });

  it("exists", function(){
    var mockPlatformIOFunctions = require(mockIOProviderPath)(),
    retriever = require(retrieverPath)(mockPlatformIOFunctions, coreUrl);

    assert.notEqual(retriever, undefined);
  });

  it("rejects when disconnected", function() {
    var platformIOFunctions, retriever;
    mockIOScenario.disconnected = true;
    platformIOFunctions = require("../platform/mock-io-provider.js")(mockIOScenario);
    retriever = require(retrieverPath)(platformIOFunctions, coreUrl);

    return retriever.loadRemoteSchedule()
    .then(function(resp) {
      assert.fail("Should not be here");
    })
    .catch(function(resp) {
      assert.ok(/no connection/.test(resp));
    });
  });

  it("rejects when local storage retrieval fails", function() {
    var platformIOFunctions, retriever;
    mockIOScenario.failedLocalStorage.get = true;
    platformIOFunctions = require(mockIOProviderPath)(mockIOScenario);
    retriever = require(retrieverPath)(platformIOFunctions, coreUrl);

    return retriever.loadRemoteSchedule()
    .then(function(resp) {
      assert.fail(resp, "rejection", "expected rejected promise");
    })
    .catch(function(err) {
      assert.ok(err.message.indexOf("error retrieving display id") > - 1);
    });
  });

  it("rejects when no display id is stored", function() {
    var platformIOFunctions, retriever;
    mockIOScenario.failedLocalStorage.emptyGet = true;
    platformIOFunctions = require(mockIOProviderPath)(mockIOScenario);
    retriever = require(retrieverPath)(platformIOFunctions, coreUrl);

    return retriever.loadRemoteSchedule()
    .then(function(resp) {
      assert.fail(resp, "rejection", "expected rejected promise");
    })
    .catch(function(err) {
      assert.ok(err.message.indexOf("no display id") > -1);
    });
  });

  it("retrieves displayId from local storage", function() {
    var platformIOFunctions = require(mockIOProviderPath)(),
    retriever = require(retrieverPath)(platformIOFunctions, coreUrl);

    return retriever.loadRemoteSchedule()
    .then(function(resp) {
      assert.equal(platformIOFunctions.getCalledParams().localStorage.get, "displayId");
    });
  });

  it("fetches remote schedule url", function() {
    var platformIOFunctions = require(mockIOProviderPath)(),
    retriever = require(retrieverPath)(platformIOFunctions, coreUrl);

    return retriever.loadRemoteSchedule()
    .then(function() {
      assert.equal(platformIOFunctions.getCalledParams().httpFetcher, "test");
    });
  });

  it("throws if no schedule in response", function() {
    var platformIOFunctions, retriever;
    mockIOScenario.fetchContent = {content:{empty:{}}};
    platformIOFunctions = require(mockIOProviderPath)(mockIOScenario);
    retriever = require(retrieverPath)(platformIOFunctions, coreUrl);

    return retriever.loadRemoteSchedule()
    .then(function() {
      assert.fail(null, null, "expected rejected promise");
    })
    .catch(function(resp) {
      assert(resp.message.indexOf("no schedule data") > -1, "invalid failure message");
    });
  });

  it("saves local schedule", function() {
    var platformIOFunctions = require(mockIOProviderPath)(),
    retriever = require(retrieverPath)(platformIOFunctions, coreUrl);

    return retriever.loadRemoteSchedule()
    .then(function(resp) {
      assert.equal(resp, true);
    });
  });

  it("rejects on local storage update failure", function() {
    var platformIOFunctions, retriever;

    mockIOScenario.failedLocalStorage = {set: true};
    platformIOFunctions = require(mockIOProviderPath)(mockIOScenario);
    retriever = require(retrieverPath)(platformIOFunctions, coreUrl);

    return retriever.loadRemoteSchedule()
    .then(function(resp) {
      assert.fail(null, null, "received resolved promise on failed storage update");
    })
    .catch(function(err) {
      assert.ok(err.message.indexOf("error saving schedule") > -1);
    });
  });
});
