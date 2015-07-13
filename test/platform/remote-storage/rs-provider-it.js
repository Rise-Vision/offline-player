"use strict";
var assert = require("assert"),
platformIO = require("../../../app/player/platform/io-provider.js"),
serviceUrls = require("../../../app/player/options/service-urls.js")(platformIO),
platformRS = require("../../../app/player/platform/remote-storage/rs-provider.js")(platformIO, serviceUrls);

describe("remote storage provider", function() {
  it("registers GCM targets", function() {
    var riseUrl = "//risemedialibrary-232323232323232323232323232323222222/test1",
    baseTarget = {objectReference: riseUrl};

    return platformIO.localObjectStore.set({ gcmRegistrationId: "testId" })
    .then(function() {
      return platformRS.registerTargets([baseTarget], true);
    })
    .then(function() {
      return platformIO.localObjectStore.get(["gcmTargets"]);
    })
    .then(function(data) {
      assert.equal
      (data.gcmTargets[0], riseUrl.substr(0, riseUrl.lastIndexOf("/") + 1));
    });
  });
});
