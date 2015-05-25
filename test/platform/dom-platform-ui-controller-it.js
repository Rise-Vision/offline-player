"use strict";
var domPlatformController = require("../../app/player/platform/dom-platform-ui-controller.js"),
assert = require("assert"),
div = domPlatformController.createElement("div");

assert.equal(div.nodeName, "DIV");

domPlatformController.setElementHeight(div, 500);
assert.equal(div.style.height, "500px");

domPlatformController.setElementWidth(div, 500);
assert.equal(div.style.width, "500px");

domPlatformController.setVisibility(div, true);
assert.equal(div.style.display, "block");

domPlatformController.setVisibility(div, false);
assert.equal(div.style.display, "none");

domPlatformController.appendChild(div, domPlatformController.createElement("a"));
assert.equal(div.childNodes.length, 1);

domPlatformController.removeChild(div, div.childNodes[0]);
assert.equal(div.childNodes.length, 0);

assert.equal(domPlatformController.getPrimaryElement(), document.body);

assert.equal(domPlatformController.getUIHeight(), 0);
assert.equal(domPlatformController.getUIWidth(), 0);

assert.equal(domPlatformController.requestElementPointerLock(div), undefined);
