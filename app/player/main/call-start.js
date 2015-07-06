var starter = require("./start.js"),
platformIO = require("../platform/io-provider.js"),
serviceUrls = require("../options/service-urls.js")(platformIO);
starter(serviceUrls);
