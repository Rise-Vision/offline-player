window.addEventListener("load", function() {
  var coreUrls = require("./core-urls.js"),
  controller = require("./options-page-controller.js")(coreUrls);

  (function setOptionsWindowCloseTimeout() {
    var timeoutHandle;

    timeoutHandle = setTimeout(function() {window.close();}, 10000);

    document.addEventListener("click", function() {
      clearTimeout(timeoutHandle);
    });
  }());

  controller.setDimensions({width: screen.width, height: screen.height});

  (function restoreUIFields() {
    chrome.storage.local.get(Object.keys(controller.getUIValues()),
    controller.setUIValues);
  }());

  controller.setUIFieldMapObserver(function(changes) {
    var latestChanges = changes.pop().object;

    for (var elementId in latestChanges) {
      document.getElementById(elementId).value = latestChanges[elementId];
    }

    chrome.storage.local.set(latestChanges, function() {
      if (chrome.runtime.lastError) {
        controller.setUIStatus
        ({message: "Could not save info", severity: "severe"});
      }
    });
  });

  controller.setUIStatusObserver(function(changes) {
    document.getElementById("status").dispatchEvent
    (new CustomEvent("status.update", {detail: changes}));
  });

  (function bindDomInputListeners() {
    addListener("close", "click", function() {window.close();});
    addListener("displayIdApply", "click", require("./display-id-click-listener.js")(controller));
    addListener("claimIdApply", "click", require("./claim-id-click-listener.js")(controller));
    addListener("status", "status.update", require("./status-field-listener.js"));

    function addListener(id, evt, fn) {
      document.getElementById(id).addEventListener("click", fn);
    }
  }());
});
