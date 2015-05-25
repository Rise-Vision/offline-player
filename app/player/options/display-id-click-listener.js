function displayIdClickListener(controller) {
  return function() {
    var id = document.getElementById("displayId").value;

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
    })
    .then(null, function(err) {
      controller.setUIStatus({message: "Error applying display id.", severity: "warning"});
    });
  };
}

module.exports = displayIdClickListener;
