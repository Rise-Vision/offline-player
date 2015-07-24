function displayIdClickListener(controller, externalLogger) {
  return function() {
    var displayReadySection = document.getElementById("displayReadySection");
    var displaySetupSection = document.getElementById("displaySetupSection");
    var displayId = document.getElementById("displayId");
    var id = displayId.value;

    controller.clearUIStatus();
    
    fetch(controller.assemblePlatformDetailsUrl(id), {credentials: "include"})
    .then(function(resp) {
      return resp.text();
    })
    .then(function(text) {
      if (/multiple.* display id/i.test(text)) {
        throw new Error(text);
      }
      return fetch(controller.assembleDisplayNameFetchUrl(id));
    })
    .then(function(resp) {
      return resp.json();
    })
    .then(function(resp) {
      if (!resp.item || !resp.item.displayName) {
        throw new Error(JSON.stringify(resp));
      }

      controller.setUIValues({
        displayName: resp.item.displayName,
        displayId: id
      });

      displaySetupSection.style.display = "none";
      displayReadySection.style.display = "block";
    })
    .catch(function(err) {
      console.log(err.message);
      if (/display.* not found/i.test(err.message)) {
        controller.setUIStatus({message: "Display ID is invalid. Please enter a valid display ID.", severity: "warning"});
        externalLogger.sendEvent("invalid diplayId");
        return;
      }
      if (/multiple.* display id/i.test(err.message)) {
        controller.setUIStatus({message: "One or more displays are trying " +
        "to use this display ID. Please register this display with a unique ID.",
        severity: "warning"});
        externalLogger.sendEvent("duplicate display id");
        return;
      }
      controller.setUIStatus({message: "Error applying display id.",
      severity: "warning"});
    });
  };
}

module.exports = displayIdClickListener;
