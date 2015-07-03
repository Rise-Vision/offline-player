module.exports = function(platformIO) {
  var httpMethod = "POST",
  key = "tTH2ZH3vSgxSDYsEeFMLK2ZDIPKq762j",
  encodedKey = new Buffer(key).toString('base64'),
  headers = [
    "Content-Type: application/json",
    "Authorization: Basic " + encodedKey
  ],
  eventEndpoint = "https://api.segment.io/v1/track",
  defaultEventData = {
    "userId": "",
    "event": "",
    "type": "track",
    "context": {
      "app": {
        "name": platformIO.baseName,
        "version": platformIO.baseVersion
      },
    },
    "integrations": {
      "All": true
    },
    "timestamp": ""
  };

  return {
    updateUserName: function(id) {
      defaultEventData.userId = id;
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
