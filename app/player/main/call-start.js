var starter = require("./start.js"),
platformIO = require("../platform/io-provider.js"),
platformInfo = require("../platform/platform-info.js")
(platformIO, "http://ident.me"),
bqCreds = require("../../../private-keys/offline-player/bigquery-credentials.js"),
externalLogger,
serviceUrls;

platformInfo.initPlatform()
.then(platformInfo.initIPAddress)
.then(function() {
  serviceUrls = require("../options/service-urls.js")(platformInfo, bqCreds);
  externalLogger = require("../logging/external-logger-bigquery.js")
  (platformIO, platformInfo, serviceUrls);
  starter(serviceUrls, externalLogger);
});
