module.exports = function(platformIO) {
  var httpMethod = "POST",
  key = "tTH2ZH3vSgxSDYsEeFMLK2ZDIPKq762j",
  encodedKey = new Buffer(key).toString('base64'),
  headers = [
    "Content-Type: application/json",
    "Authorization: Basic " + encodedKey
  ],
  eventEndpoint = "https://api.segment.io/v1/track",
  defaultData = {
    "userId": "",
    "event": "",
    "context": {
      "ip": "24.5.68.47"
    },
    "timestamp": "2012-12-02T00:30:12.984Z"
  };

  dataObj = platformIO.localObjectStore.get(["displayId"])
  .then(function(objectStore) {
    var dataObj = defaultData;
    dataObj.userId = "anon";
    if (objectStore.displayId) {dataObj.userId = displayId; return dataObj;}
    return dataObj;
  });


  return {
    identify: function() {},
    sendEvent: function(eventName) {
      return dataObj.then(function(dataObj) {
        var data = JSON.parse(JSON.stringify(dataObj));
        data.timestamp = new Date();
        data.event = eventName;
        
        return platformIO.httpFetcher.fetch(eventEndpoint, {
          method: httpMethod,
          body: JSON.stringify(data),
          headers: headers
        });
      });
    }
  };
};
