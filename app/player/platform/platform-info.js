module.exports = function(platformIO, serviceUrls) {
  var ipAddress = {text: ""};

  return {
    version: navigator.appVersion.match(/Chrome\/([0-9.]+)/)[1],
    name: "Chrome",
    baseName: "Offline Player",
    baseVersion: chrome.runtime.getManifest().version,
    basePlatform: navigator.platform.replace(" ", ""),
    ipAddress: ipAddress,

    resolveIPAddress: function() {
      return platformIO.httpFetcher(serviceUrls.ipAddressResolver)
      .then(function(resp) {return resp.text();})
      .then(function(text) {ipAddress.text = text; return true;})
      .catch(function(err) {console.log("Could not resolve IP: " + err);});
    }
  };
};
