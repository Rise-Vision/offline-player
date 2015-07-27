module.exports = function(ioProvider) {
  var eventHandlers = [];
  var status = ioProvider.isNetworkConnected();

  chrome.alarms.create("navigator.onLine.check", { periodInMinutes: 1 });
  
  chrome.alarms.onAlarm.addListener(function(alarm) {
    var currentStatus = ioProvider.isNetworkConnected();

    if (alarm.name === "navigator.onLine.check" && status !== currentStatus) {
      status = currentStatus;

      eventHandlers.forEach(function(eventHandler) {
        eventHandler(status);
      });
    }
  });

  return {
    addEventHandler: function(handler) {
      eventHandlers.push(handler);
    },
    resetEventHandlers: function() {
      eventHandlers = [];
    },
  };
};
