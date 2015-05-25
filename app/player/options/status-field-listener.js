function updateStatusFieldUI(evt) {
  var el = document.getElementById("status"),
  changes = evt.detail;

  el.innerHTML = changes[changes.length - 1].object.message;
  el.style.display = "block";
  el.style.backgroundColor = "Red";
}

module.exports = updateStatusFieldUI;
