module.exports = function(platformIO, platformInfo, serviceUrls) {
  var httpMethod = "POST",
  creds = require("../../../private-keys/offline-player/bigquery-credentials.js"),
  headers = ["Content-Type: application/json", ""],
  eventEndpoint = serviceUrls.externalLog,
  authRefreshEndpoint = serviceUrls.externalLogAuthRefresh,
  lastTokenRefresh = 0,
  defaultEventData = {
    "kind": "bigquery#tableDataInsertAllRequest",
    "skipInvalidRows": false,
    "ignoreUnknownValues": false,
    "rows": [
      {
        "insertId": "",
        "json": {
          "event": "",
          "display_id": "",
          "ip": "",
          "os": platformInfo.basePlatform.os + "/" + platformInfo.basePlatform.arch,
          "chrome_version": platformInfo.version,
          "olp_version": platformInfo.baseVersion,
          "time_millis": 0
        }
      }
    ]
  };

  (function initializeDisplayId() {
    platformIO.localObjectStore.get(["displayId"])
    .then(function(storageResult) {
      defaultEventData.rows[0].json.display_id = storageResult.displayId;
    });
  }());

  function addTableNameToEventEndpoint() {
    var date = new Date(),
    year = date.getFullYear(),
    month = date.getMonth() + 1,
    day = date.getDate();

    if (month < 10) {month = "0" + month;}
    if (day < 10) {day = "0" + day;}

    return eventEndpoint.replace("TABLE_ID", "events" + year + month + day);
  }

  function getToken() {
    return new Promise(function(resolve, reject) {
      if (new Date() - lastTokenRefresh < 3580000) {
        return resolve({});
      }

      platformIO.httpFetcher(authRefreshEndpoint, {method: httpMethod})
      .then(function(resp) {
        return resp.json();
      })
      .then(function(json) {
        token = json.access_token;
        lastTokenRefresh = new Date();
        resolve();
      })
      .catch(function(err) {
        reject(err);
      });
    });
  }

  return {
    updateDisplayId: function(id) {
      defaultEventData.rows[0].json.display_id = id;
      return id;
    },
    sendEvent: function(eventName) {
      if (!eventName) {return;}
      var data = JSON.parse(JSON.stringify(defaultEventData));
      data.rows[0].insertId = Math.random().toString(36).substr(2).toUpperCase();
      data.rows[0].json.ip = platformInfo.ipAddress.text;
      data.rows[0].json.time_millis = new Date() - 0;
      data.rows[0].json.event = eventName;

      return getToken().then(function() {
        headers[1] = "Authorization: Bearer " + token;

        return platformIO.httpFetcher(addTableNameToEventEndpoint(), {
          method: httpMethod,
          body: JSON.stringify(data),
          headers: headers
        });
      })
      .catch(function(err) {
        console.log("Could not send external log event: " + err.message);
      });
    }
  };
};
