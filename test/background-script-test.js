"use strict";
var assert = require("assert"),
    bg = require("../app/player/main/background-script.js");

describe("background script", function() {
  it("exists", function() {
    assert.notEqual(bg, undefined);
  });

  it("starts with the options window", function() {
    var chromeMock = {
      app: {
        window: {
          create: function(){}
        },
        runtime: {
          onLaunched: {
            addListener: function(cb) {cb();}
          }
        }
      }
    },

    screenMock = {
      availWidth: 0,
      availHeight: 0
    };

    bg(chromeMock, screenMock);
  });
});
