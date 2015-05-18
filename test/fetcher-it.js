"use strict";

var fetcher = require("../app/player/platform/fetcher.js");

fetcher.fetch("http://www.google.com")
.then(function(resp) { return resp.text(); })
.then(function(text) {if (/html/i.test(text)) {window.close();}});
