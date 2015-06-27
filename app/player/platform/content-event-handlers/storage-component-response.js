module.exports = {
  handles: function(evt) {
  	return evt.data.type === "storage-component-response";
  },

  process: function(evt) {
    if (!evt.data.response) {
      respondWithError("response field must exist");
      return false;
    }

    console.log(evt.data);
    
    return true;

    function respondWithError(err) {
      evt.data.error = err;
      evt.source.postMessage(evt.data, "*");
    }
  }
};
