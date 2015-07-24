window.addEventListener("load", function() {
  var platformIO = require("../platform/io-provider.js"),
  platformInfo = require("../platform/platform-info.js")
  (platformIO, "http://ident.me"),
  bigQueryCredentials = require("../../../private-keys/offline-player/bigquery-credentials.js"),
  serviceUrls,
  controller,
  externalLogger;

  platformIO.localObjectStore.get(["ipAddress"])
  .then(function(resp) {
    platformInfo.setIPAddress(resp.ipAddress);
  });

  chrome.storage.onChanged.addListener(function(changes) {
    if (!changes.ipAddress) {return;}
    platformInfo.setIPAddress(changes.ipAddress.newValue);
  });

  platformInfo.initPlatform()
  .then(function() {
    serviceUrls = require("./service-urls.js")(platformInfo, bigQueryCredentials);
    controller = require("./options-page-controller.js")(serviceUrls);
    externalLogger = require("../logging/external-logger-bigquery.js")
    (platformIO, platformInfo, serviceUrls);

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

    (function setupOnlineCheck() {
      var intervalHandle;

      console.log("setting up online check");
      if (navigator.onLine) {return;}

      intervalHandle = setInterval(checkForOnlineChange, 5000);

      function checkForOnlineChange() {
        if (navigator.onLine) {
          clearInterval(intervalHandle);
          initializeSections();
        }
      }
    }());

    (function bindDomInputListeners() {
      addListener("close", "click", function() {window.close();});
      addListener("displayIdApply", "click", require("./display-id-click-listener.js")(controller, externalLogger));
      addListener("claimIdApply", "click", require("./claim-id-click-listener.js")(controller));
      addListener("changeDisplayIdApply", "click", require("./change-display-id-click-listener.js")(controller));
      addListener("status", "status.update", require("./status-field-listener.js"));

      function addListener(id, evt, fn) {
        document.getElementById(id).addEventListener(evt, fn);
      }
    }());

    function initializeSections() {
      console.log("Initializing options page sections");
      var uiValues = controller.getUIValues();

      if(!uiValues.displayId) {
        controller.setUIValues({
          claimId: "",
          displayName: ""
        });      
      }

      controller.clearUIStatus();

      if (!navigator.onLine && !uiValues.displayId) {
        controller.setUIStatus({message: "Unable to register this Display. Please make sure this device is connected to the Internet.", severity: "severe"});
      }

      document.getElementById("displayReadySection").style.display = uiValues.displayId ? "block" : "none";
      document.getElementById("displaySetupSection").style.display = uiValues.displayId ? "none" : (navigator.onLine) ? "block" : "none";
    }
  });
});
