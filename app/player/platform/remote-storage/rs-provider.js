module.exports = function(platformIO, serviceUrls) {
  (function registerRemoteStorageId() {
    var gcmProjectId = "642011540044";

    chrome.gcm.register([gcmProjectId], function(registrationId) {
      if (chrome.runtime.lastError) {
        console.log("GCM Registration failed " + chrome.runtime.lastError);
      }
      else {
        platformIO.localObjectStore.set({ gcmRegistrationId: registrationId });
      }
    });
  }());

  return {
    registerTargets: function (targets, reset) {
      if(!platformIO.isNetworkConnected()) {
        return Promise.reject("Player is in offline mode");
      }

      var validTargets = targets.map(function(scheduleItem) {
        var url = scheduleItem.objectReference;
        return url.substr(0, url.lastIndexOf("/") + 1);
      }).filter(function(url) {
        return /risemedialibrary-.{36}\//.test(url);
      });

      return platformIO.localObjectStore.get(["gcmRegistrationId", "gcmTargets"])
      .then(function(storageItems) {
        var gcmRegistrationId = storageItems.gcmRegistrationId,
        gcmTargets = storageItems.gcmTargets,
        targetRegistrationUrl = serviceUrls.registerTargetUrl.replace
        ("GCM_CLIENT_ID", gcmRegistrationId);

        if(gcmRegistrationId) {
          gcmTargets = reset ? [] : (storageItems.gcmTargets || []);

          validTargets.forEach(function(target) {
            gcmTargets.push(target);
          });

          return platformIO.localObjectStore.set({ gcmTargets: gcmTargets })
          .then(function() {
            var prefix = "risemedialibrary-",
            targetParam = "".concat.apply("", gcmTargets.map(function(t) {
              return "&targets=" + encodeURIComponent(t.substr(t.indexOf(prefix)));
            }));

            return platformIO.httpFetcher(targetRegistrationUrl + targetParam, {
              mode: "no-cors"
            });
          });
        }
      });
    },
    registerRemoteStorageListener: function(listener) {
      if(typeof(chrome) !== "undefined" && chrome.gcm) {
        chrome.gcm.onMessage.addListener(listener);
      }
    }
  };
};
