function claimIdClickListener(controller) {
  return function() {
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
    .then(function sendPlatformDetails() {
      return fetch(controller.assemblePlatformDetailsUrl(),
      {credentials: "include"});
    })
    .then(null, function(err) {
      controller.setUIStatus({message: "Error applying claim id. " + err, severity: "severe"});
    });
  };
}

module.exports = claimIdClickListener;
