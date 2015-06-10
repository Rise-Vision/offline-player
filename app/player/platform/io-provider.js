module.exports = {
  localStorage: chrome.storage.local,
  httpFetcher: fetch,
  hasErrorState: function() {return chrome.runtime.lastError;},
  isNetworkConnected: function() {return navigator.onLine;}
};
