var starter = require("./start.js"),
platformInfo = require("../platform/platform-info.js")(),
bqCreds = require("../../../private-keys/offline-player/bigquery-credentials.js");
platformInfo.initPlatform().then(function() {
  serviceUrls = require("../options/service-urls.js")(platformInfo, bqCreds);
  starter(serviceUrls);
});
