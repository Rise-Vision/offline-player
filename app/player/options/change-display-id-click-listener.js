function changeDisplayIdClickListener(controller) {
  return function() {
    var displayId = document.getElementById("displayId");
    var displayReadySection = document.getElementById("displayReadySection");
    var displaySetupSection = document.getElementById("displaySetupSection");
    
    displaySetupSection.style.display = "block";
    displayReadySection.style.display = "none";

    controller.setUIValues({
      claimId: "",
      displayId: "",
      displayName: ""
    });
  };
}

module.exports = changeDisplayIdClickListener;
