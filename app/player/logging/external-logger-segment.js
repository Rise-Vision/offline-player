module.exports = function(platformIO, serviceUrls) {
  var httpMethod = "POST",
  key = require("../../../private-keys/offline-player/segment-key.js"),
  encodedKey = new Buffer(key).toString('base64'),
  headers = [
    "Content-Type: application/json",
    "Authorization: Basic " + encodedKey
  ],
  eventEndpoint = serviceUrls.segmentIOEventEndpoint,
  defaultEventData = {
    "userId": "",
    "event": "",
    "type": "track",
    "context": {
      "app": {
        "name": platformIO.baseName,
        "version": platformIO.baseVersion
      },
      "os": {
        "name": platformIO.basePlatform,
        "version": platformIO.version
      },
    },
    "integrations": {
      "All": true
    },
    "timestamp": ""
  };

  (function initializeUserId() {
    platformIO.localObjectStore.get(["displayId"])
    .then(function(storageResult) {
      defaultEventData.userId = storageResult.displayId;
    });
  }());

  return {
    updateUserName: function(id) {
      defaultEventData.userId = id;
      return id;
    },
    sendEvent: function(eventName) {
      var data = JSON.parse(JSON.stringify(defaultEventData));
      if (!data.userId) {
        data.anonymousId = "anonymous";
      }
      data.timestamp = new Date();
      data.event = eventName;

      return platformIO.httpFetcher(eventEndpoint, {
        method: httpMethod,
        body: JSON.stringify(data),
        headers: headers
      });
    }
  };
};
