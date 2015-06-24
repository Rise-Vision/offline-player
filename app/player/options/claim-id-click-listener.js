function claimIdClickListener(controller) {
  return function() {
    var displayId = document.getElementById("displayId");
    var displayReadySection = document.getElementById("displayReadySection");
    var displaySetupSection = document.getElementById("displaySetupSection");

    controller.clearUIStatus();

    controller.setUIValues({
      claimId: document.getElementById("claimId").value,
      displayName: document.getElementById("displayName").value
    });

    controller.verifyOnline(navigator.onLine)
    .then(function registerWithClaimId() {
      return fetch(controller.assembleRegistrationUrl());
    })
    .then(function processCoreResponse(resp) {
      return resp.json();
    })
    .then(controller.setDisplayIdFromJson)
    .then(function() {
      displaySetupSection.style.display = "none";
      displayReadySection.style.display = "block";
    })
    .then(function sendPlatformDetails() {
      console.log("Handler 2");
      return fetch(controller.assemblePlatformDetailsUrl(),
      {credentials: "include"});
    })
    .then(null, function(err) {
      controller.setUIStatus({message: "Error applying claim id. " + err, severity: "severe"});
    });
  };
}

module.exports = claimIdClickListener;
