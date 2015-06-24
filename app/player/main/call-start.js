var starter = require("./start.js"),
serviceUrls = require("../options/service-urls.js")(navigator.platform.replace(" ", "/"));
starter(serviceUrls);
