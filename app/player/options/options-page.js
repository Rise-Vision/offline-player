window.addEventListener("load", function() {
  var registrationUrl = "https://rvacore-test.appspot.com/v2/viewer/display/CLAIM_ID/register?width=WIDTH&height=HEIGHT&name=NAME";

  chrome.storage.local.get(["displayId", "claimId"], function restoreOptions(items) {
    document.getElementById("displayId").value = items.displayId;
    document.getElementById("claimId").value = items.claimId;
  });

  document.getElementById("close").addEventListener("click", function() {
    window.close();
  });

  document.getElementById("apply").addEventListener("click", function() {
    var displayId = document.getElementById("displayId").value,
    claimId = document.getElementById("claimId").value;

    chrome.storage.local.set({
      displayId: displayId,
      claimId: claimId
    }, function() {
      if (chrome.runtime.lastError) {
        document.getElementById("statusError").style.display = "block";
        document.getElementById("statusError").innerHTML = "Could not save options";
        return;
      }

      if (!navigator.onLine) {
        return setStatus("Offline", "Yellow");
      }

      registerWithUrl();
    });

    function setStatus(msg, color) {
      var el = document.getElementById("status");
      el.innerHTML = msg;
      el.style.display = "block";
      el.style.backgroundColor = color;
    }

    function getRegistrationUrl() {
      return registrationUrl
      .replace("CLAIM_ID", claimId)
      .replace("WIDTH", screen.width)
      .replace("NAME", "offline player test")
      .replace("HEIGHT", screen.height);
    }

    function registerWithUrl() {
      fetch(getRegistrationUrl()).then(function(response) {
        return response.json();
      }).then(function handleRegistrationResponse(json) {
        if (!json.displayId) {
          return setStatus("Error response retrieving displayId. " +
          "Please try again.", "Red");
        }

        document.getElementById("displayId").value = json.displayId;
        chrome.storage.local.set({displayId: json.displayId}, function() {
          if (chrome.runtime.lastError) {
            return setStatus("Could not save displayId", "Red");
          }

          setStatus("Success", "Green");
        });
      }).then(null, function() {
        return setStatus("Error requesting displayId. " +
        "Please try again.", "Red");
      });
    }
  });
});
