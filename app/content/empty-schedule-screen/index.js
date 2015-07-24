window.addEventListener("load", function() {
  var msg = decodeURIComponent(location.search.substr(1));
  document.querySelector("div").innerHTML = msg;

  setInterval(function() {
    var displacement = Math.floor(400 * Math.random()),
    dir = Math.random() > 0.5 ? "-" : "";

    document.querySelector("div").style.marginTop = dir + displacement + "px";
  }, 20000);
});
