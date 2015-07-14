var starter = require("./start.js"),
platformInfo = require("../platform/version-info.js"),
serviceUrls = require("../options/service-urls.js")(platformInfo);
starter(serviceUrls);
