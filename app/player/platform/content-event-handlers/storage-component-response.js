module.exports = {
  handles: function(evt) {
  	return evt.data.type === "storage-component-response";
  },

  process: function(evt) {
    console.log("storage-component-response: ", evt.data);
    
    if (!evt.data.response) {
      respondWithError("response field must exist");
      return false;
    }

    return true;

    function respondWithError(err) {
      evt.data.error = err;
      evt.source.postMessage(evt.data, "*");
    }
  }
};
