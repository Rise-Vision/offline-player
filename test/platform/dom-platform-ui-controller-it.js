"use strict";
var domPlatformController = require("../../app/player/platform/dom-platform-ui-controller.js"),
assert = require("assert"),
view = domPlatformController.createViewWindow();

assert.equal(view.nodeName, "WEBVIEW");

domPlatformController.setElementHeight(view, 500);
assert.equal(view.style.height, "500px");

domPlatformController.setElementWidth(view, 500);
assert.equal(view.style.width, "500px");

domPlatformController.setVisibility(view, true);
assert.equal(view.style.display, "block");

domPlatformController.setVisibility(view, false);
assert.equal(view.style.display, "none");

domPlatformController.addView(view);
assert.equal(document.body.childNodes.length, 1);

domPlatformController.removeChild(view, view.childNodes[0]);
assert.equal(view.childNodes.length, 0);

assert.equal(domPlatformController.getUIHeight(), 0);
assert.equal(domPlatformController.getUIWidth(), 0);

assert.equal(domPlatformController.requestElementPointerLock(view), undefined);
