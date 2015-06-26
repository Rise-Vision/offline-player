module.exports = {
  handles: function(evt) {
  	return evt.data.type === "bypasscors";
  },

  process: function(evt) {
    if (!evt.data.url || evt.data.url.indexOf("http") !== 0) {
      respondWithError("URL must contain scheme name");
      return false;
    }

    fetch(evt.data.url)
    .then(function(resp) {
      return resp.text();
    })
    .then(function(resp) {
      evt.data.response = resp;
      evt.source.postMessage(evt.data, "*");
    })
    .then(null, function(err) {
      respondWithError(err.toString());
    });

    return true;

    function respondWithError(err) {
      evt.data.error = err;
      evt.source.postMessage(evt.data, "*");
    }
  }
};
