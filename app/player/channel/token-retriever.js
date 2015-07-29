module.exports = function(platformIO, serviceUrls) {
  var VIEWER_VERSION = "OLP";
  var uid;

  return {
    getViewerVersion: function() {
      return VIEWER_VERSION;
    },
    getUID: function() {
      return uid;
    },
    getToken: function(renewUID) {
      if(!uid || renewUID) {
        uid = generateUID();
      }

      return getDisplayIdFromLocalStorage()
        .then(generateTokenRequestUrl)
        .then(requestToken)
        .then(extractToken);
    }
  };

  function generateUID() {
    return Math.round(Math.random() * 10000) + "_" + new Date().getTime();
  }

  function getDisplayIdFromLocalStorage() {
    return platformIO.localObjectStore.get(["displayId"])
    .then(function(items) {
      if (!items.displayId) {throw err("no display id found in local storage");}
      return items.displayId;
    })
    .catch(function(e) {
      throw err("error retrieving display id from local storage - " + e.message);
    });
  }

  function generateTokenRequestUrl(displayId) {
    return Promise.resolve(serviceUrls.tokenServerUrl
            .replace("DISPLAY_ID", displayId)
            .replace("UID", uid)
            .replace("VIEWER_VERSION", VIEWER_VERSION));
  }

  function requestToken(tokenRequestUrl) {
    return platformIO.httpFetcher(tokenRequestUrl, {credentials: "include"})
    .then(function(resp) {
      return resp.json();
    })
    .catch(function() {
      logger.external("request token fetch failed");
      return Promise.reject();
    });
  }

  function extractToken(data) {
    if(data.token && data.token !== "null") {
      logger.external("channel token retrieved");
      return Promise.resolve(data.token);
    }
    else {
      logger.external("invalid channel token null");
      return Promise.reject("Invalid channel token - Null");
    }
  }
};
