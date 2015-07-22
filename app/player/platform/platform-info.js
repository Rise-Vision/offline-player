module.exports = function(platformIO, ipAddressResolverUrl) {
  var ipAddress = {text: ""},
  platform = {arch: "", os: ""};

  return {
    version: navigator.appVersion.match(/Chrome\/([0-9.]+)/)[1],
    name: "Chrome",
    baseName: "Offline Player",
    baseVersion: chrome.runtime.getManifest().version,
    basePlatform: platform,
    ipAddress: ipAddress,

    initPlatform: function() {
      return new Promise(function(resolve, reject) {
        chrome.runtime.getPlatformInfo(function(info) {
          if (chrome.runtime.lastError) {
            console.log("Could not retrieve platform info");
            return resolve();
          }
          platform.arch = info.arch;
          platform.os = info.os;
          console.log("Platform base is " + JSON.stringify(platform));
          resolve();
        });
      });
    },
    initIPAddress: function() {
      return platformIO.httpFetcher(ipAddressResolverUrl)
      .then(function(resp) {return resp.text();})
      .then(function(text) {ipAddress.text = text; return true;})
      .catch(function(err) {console.log("Could not resolve IP: " + err);})
    }
  };
};
