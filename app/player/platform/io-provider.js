function localStorage(getOrSet, itemArray) {
  return new Promise(function(resolve, reject) {
    chrome.storage.local[getOrSet](itemArray, function(items) {
      if (chrome.runtime.lastError) {return reject(chrome.runtime.lastError);}
      resolve(items);
    });
  });
}

module.exports = {
  version: navigator.appVersion.match(/Chrome\/([0-9.]*)/)[1],
  name: "Chrome",
  baseName: "Offline Player",
  baseVersion: chrome.runtime.getManifest().version,
  basePlatform: navigator.platform.replace(" ", ""),
  httpFetcher: function(dest, opts) {
    if (!opts) {
      return fetch(dest);
    }

    setHeaders();
    return fetch(dest, opts);

    function setHeaders() {
      var headerArray = opts.headers,
      headers;

      if (!headerArray) {return;}

      headers = new Headers();

      headerArray.forEach(function(header) {
        var nameValue = header.split(":");
        headers.append(nameValue[0], nameValue[1].replace(" ", ""));
      });

      opts.headers = headers;
    }
  },
  localObjectStore: {
    get: function(itemArray) {return localStorage("get", itemArray);},
    set: function(itemArray) {return localStorage("set", itemArray);}
  },
  isNetworkConnected: function() {return navigator.onLine;}
};
