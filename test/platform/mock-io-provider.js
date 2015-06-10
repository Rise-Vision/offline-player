"use strict";
module.exports = {
  networkFetcher: function() {return Promise.resolve({json: function() {return {};}});},
  localStorage: {set: function(target, cb){return cb();}} ,
  errorHandle: {lastError: false}
};
