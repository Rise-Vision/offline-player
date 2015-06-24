function updateStatusFieldUI(evt) {
  var el = document.getElementById("status"),
  container = document.getElementById("statusContainer"),
  changes = evt.detail,
  message = changes[changes.length - 1].object.message;

  el.innerHTML = message;
  statusContainer.style.display = message ? "block" : "none";
}

module.exports = updateStatusFieldUI;
