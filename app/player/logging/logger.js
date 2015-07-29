module.exports = function(externalLogger) {
  return {
    console: function(msg) {
      console.log(msg); 
      return true;
    },
    external: function(eventName) {
      return externalLogger.sendEvent(eventName);
    },
    display: function(msg) {
      return true;
    }
  };
};
