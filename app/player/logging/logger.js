module.exports = function(externalLogger) {
  return {
    console: function(msg) {
      console.log(msg); 
      return true;
    },
    external: function(eventName) {
      externalLogger.sendEvent(eventName);
      return true;
    },
    display: function(msg) {
      return true;
    }
  };
};
