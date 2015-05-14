window.addEventListener("load", function() {
  var registrationUrl = "https://rvacore-test.appspot.com/v2/viewer/display/CLAIM_ID/register?width=WIDTH&height=HEIGHT&name=NAME",
  platformDetailsUrl = "https://rvacore-test.appspot.com/v2/viewer/display?os=" + chrome.runtime.platformOs + "&cv=" + navigator.appVersion + "&cn=Chrome&pv=0.1.1&pn=OfflinePlayer";

  chrome.storage.local.get(["displayId", "claimId"], function restoreOptions(items) {
    document.getElementById("displayId").value = items.displayId;
    document.getElementById("claimId").value = items.claimId;
  });

  document.getElementById("close").addEventListener("click", function() {
    window.close();
  });

  document.getElementById("displayIdApply").addEventListener("click", function() {
    saveDisplayId();
    fetch(platformDetailsUrl).then(null, function() {
    });
  });

  document.getElementById("helpButton").addEventListener("click", loadHelpPage);

  document.getElementById("claimIdApply").addEventListener("click", function() {
    var claimId = document.getElementById("claimId").value;

    chrome.storage.local.set({claimId: claimId}, function() {
      if (chrome.runtime.lastError) {
        return setUIStatus("Could not save claimId.", "Red");
      }

      if (!navigator.onLine) {
        return setUIStatus("No internet connection detected.", "Yellow");
      }

      registerWithUrl(assembleRegistrationUrl())
      .then(function handleRegistrationResponse(json) {
        if (!json.displayId) {
          return setUIStatus("Error response retrieving displayId. " +
          "Please try again.", "Red");
        }

        saveDisplayId(json.displayId);
      }).then(function sendPlatformDetials() {
        return fetch(platformDetailsUrl);
      }).then(null, function() {
        return setUIStatus("Error requesting displayId. " +
        "Please try again.", "Red");
      });
    });

    function registerWithUrl(url) {
      return fetch(url).then(function(response) {
        return response.json();
      });
    }

    function assembleRegistrationUrl() {
      return registrationUrl
      .replace("CLAIM_ID", claimId)
      .replace("WIDTH", screen.width)
      .replace("NAME", document.getElementById("displayName").value)
      .replace("HEIGHT", screen.height);
    }

  });

  function saveDisplayId(id) {
    var displayId = id || document.getElementById("displayId").value;

    document.getElementById("displayId").value = displayId;
    chrome.storage.local.set({displayId: displayId}, function() {
      if (chrome.runtime.lastError) {
        return setUIStatus("Could not save displayId", "Red");
      }

      setUIStatus("Success", "Green");
    });
  }

  function setUIStatus(msg, color) {
    var el = document.getElementById("status");
    el.innerHTML = msg;
    el.style.display = "block";
    el.style.backgroundColor = color;
  }

  function loadHelpPage() {
  }
});
