module.exports = function(platformInfo) {
  return {
    restart: function() {
      return new Promise(function(resolve, reject) {
        chrome.runtime.reload();
        resolve();
      });
    },
    reboot: function() {
      return new Promise(function(resolve, reject) {
        if(platformInfo.basePlatform === "cros") {
          chrome.runtime.restart();
          // If the app is in non-kiosk mode then as per documentation restart is no-op, and in this case the promise will be rejected
          reject();
        }
        else {
          reject();
        }
      });
    }
  };
};
