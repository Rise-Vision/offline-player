"use strict";
var assert = require("assert"),
serviceUrls = {
  setPlatformDetailsUrl: "setplatformdetails",
  displayNameFetchUrl: "dnf-DISPLAY_ID-",
  registrationUrl: "reg-CLAIM_ID-WIDTH-NAME-HEIGHT"
},

controller = require("../../app/player/options/options-page-controller.js")(serviceUrls);

describe("options page controller", function() {
 it("exists", function() {
   assert.ok(controller);
 });

 it("verifies offline with a promise", function() {
   return controller.verifyOnline(false)
   .then(null,function(err) {
     assert.equal(err.name, "Error");
   });
 });

 it("verifies online with a promise", function() {
   return controller.verifyOnline(true)
   .then(function(resp) {
     assert.equal(resp, true);
   });
 });

 it("sets display id from json", function() {
   return controller.setDisplayIdFromJson({displayId: "test"})
   .then(function(resp) {
     assert.equal(resp, "test");
     assert.equal(controller.getUIValues().displayId, "test");
   });
 });

 it("rejects if no display id", function() {
   return controller.setDisplayIdFromJson({noDisplayId: "test"})
   .then(null, function(resp) {
     assert.equal(resp.name, "Error");
   });
 });

 it("assembles registration url from fields", function() {
   var expectedUrl = "reg-01-0-test-0";
   controller.setUIValues({displayName: "test", claimId: "01"});
   assert.equal(controller.assembleRegistrationUrl(), expectedUrl);
 });

 it("assembles display name fetch url from fields", function() {
   var expectedUrl = "dnf-test-";
   controller.setUIValues({displayId: "test"});
   assert.equal(controller.assembleDisplayNameFetchUrl(), expectedUrl);
 });

 it("gets / sets ui values", function() {
   var vals = {displayId: 1, claimId: 2, displayName: 3};

   controller.setUIValues(vals);
   assert.deepEqual(controller.getUIValues(), vals);
 });

 it("sets and observes UI status", function() {
   var uiStatus = {};
   controller.setUIStatusObserver(function(changes) {
     uiStatus = changes.pop().object;
   });

   controller.setUIStatus({severity: 1, message: "test"});
   return new Promise(function waitForObserver(resolve) {
     var intervalHandle = setInterval(function() {
       if (uiStatus.hasOwnProperty("severity")) {
         clearInterval(intervalHandle);
         resolve(uiStatus);
       }
     }, 20);
   })
   .then(function(uiStatus) {
     assert.equal(uiStatus.severity, 1);
     assert.equal(uiStatus.message, "test");
   });
 });

 it("observes UI fields", function() {
   var observed = false;

   controller.setUIFieldMapObserver(function() {
     observed = true;
   });

   controller.setUIValues({test: "test"});

   return new Promise(function waitForObserver(resolve) {
     var intervalHandle = setInterval(function() {
       if (observed) {
         clearInterval(intervalHandle);
         resolve();
       }
     }, 20);
   })
   .then(function() {
     assert.ok(true);
   });
 });
});
