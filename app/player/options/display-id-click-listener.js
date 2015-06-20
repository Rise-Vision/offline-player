function displayIdClickListener(controller) {
  return function() {
    var displayReadySection = document.getElementById("displayReadySection");
    var displaySetupSection = document.getElementById("displaySetupSection");
    var displayId = document.getElementById("displayId");
    var id = displayId.value;

    controller.clearUIStatus();
    
    fetch(controller.assemblePlatformDetailsUrl(id), {credentials: "include"})
    .then(function() {
      return fetch(controller.assembleDisplayNameFetchUrl(id));
    })
    .then(function(resp) {
      return resp.json();
    })
    .then(function(resp) {
      if (!resp.item || !resp.item.displayName) {
        throw new Error("invalid response");
      }

      controller.setUIValues({
        displayName: resp.item.displayName,
        displayId: id
      });

      displaySetupSection.style.display = "none";
      displayReadySection.style.display = "block";
    })
    .then(null, function(err) {
      controller.setUIStatus({message: "Error applying display id.", severity: "warning"});
    });
  };
}

module.exports = displayIdClickListener;
