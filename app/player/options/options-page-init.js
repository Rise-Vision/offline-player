window.addEventListener("load", function() {
  var serviceUrls = require("./service-urls.js")(require("../platform/platform-info.js"), require("../../../private-keys/offline-player/bigquery-credentials.js")),
  controller = require("./options-page-controller.js")(serviceUrls);

  (function setOptionsWindowCloseTimeout() {
    var timeoutHandle;

    timeoutHandle = setTimeout(function() {window.close();}, 10000);

    document.addEventListener("click", function() {
      clearTimeout(timeoutHandle);
    });
  }());

  controller.setDimensions({width: screen.width, height: screen.height});

  (function restoreUIFields() {
    chrome.storage.local.get(Object.keys(controller.getUIValues()), function(values) {
      controller.setUIValues(values);
      initializeSections();
    });
  }());

  controller.setUIFieldMapObserver(function(changes) {
    var latestChanges = changes.pop().object;

    for (var elementId in latestChanges) {
      document.getElementById(elementId).value = latestChanges[elementId];
    }

    document.getElementById("displayNameReady").value = latestChanges.displayName;
    document.getElementById("displayIdReady").value = latestChanges.displayId;

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
    addListener("changeDisplayIdApply", "click", require("./change-display-id-click-listener.js")(controller));
    addListener("status", "status.update", require("./status-field-listener.js"));

    function addListener(id, evt, fn) {
      document.getElementById(id).addEventListener(evt, fn);
    }
  }());

  function initializeSections() {
    var uiValues = controller.getUIValues();

    if(!uiValues.displayId) {
      controller.setUIValues({
        claimId: "",
        displayName: ""
      });      
    }

    document.getElementById("displayReadySection").style.display = uiValues.displayId ? "block" : "none";
    document.getElementById("displaySetupSection").style.display = uiValues.displayId ? "none" : "block";
  }
});
