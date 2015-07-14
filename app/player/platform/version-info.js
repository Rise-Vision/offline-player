module.exports = {
  version: navigator.appVersion.match(/Chrome\/([0-9.]*)/)[1],
  name: "Chrome",
  baseName: "Offline Player",
  baseVersion: chrome.runtime.getManifest().version,
  basePlatform: navigator.platform.replace(" ", ""),
};
