"use strict";
var assert = require("assert"),
coreUrls = {
  setPlatformDetailsUrl: "setplatformdetails",
  displayNameFetchUrl: "displaynamefetch",
  registrationUrl: "registration"
},

controller = require("../../app/player/options/options-page-controller.js")(coreUrls),
listener = require("../../app/player/options/claim-id-click-listener.js")(controller);


describe("claim id click listener", function() {
 it("should exist", function() {
   assert.ok(listener);
 });

 xit("fetches ", function() {
 });
});
