module.exports = function(externalLogger) {
  externalLogger.identify('test');

  var externalLoggerOptions = {
    app: {
      name: "Offline Player"
    }
  };

  return {
    console: function(msg) {
      console.log(msg); 
      return true;
    },
    logExternal: function(eventName) {
      externalLogger.sendEvent(eventName, {}, externalLoggerOptions);
      return true;
    }
  };
};
