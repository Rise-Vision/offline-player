module.exports = function(externalLogger) {
  externalLogger.identify('test');

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
