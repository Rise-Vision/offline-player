module.exports = function optionsPageController(serviceUrls, externalLogger) {
  "use strict";
  var uiFieldMap = {displayId: "", claimId: "", displayName: ""},
  dimensions = {width: 0, height: 0},
  uiStatus = {color: "", message: ""};

  return {
    verifyOnline: function(online) {
      if (!online) {
        return Promise.reject(new Error("Not online"));
      }

      return Promise.resolve(true);
    },

    setDisplayIdFromJson: function(json) {
      if (/claim id.* not found/i.test(JSON.stringify(json))) {
        externalLogger.sendEvent("invalid claim id");
        return Promise.reject(new Error("Claim ID is invalid." +
        " Please enter a valid Claim ID."));
      }
      if (!json.displayId) {
        return Promise.reject(new Error("Error applying Claim ID." +
        " Invalid json response"));
      }

      uiFieldMap.displayId = json.displayId;
      return Promise.resolve(json.displayId);
    },

    assembleRegistrationUrl: function() {
      return serviceUrls.registrationUrl
      .replace("CLAIM_ID", uiFieldMap.claimId)
      .replace("WIDTH", dimensions.width)
      .replace("NAME", uiFieldMap.displayName)
      .replace("HEIGHT", dimensions.height);
    },

    assembleDisplayNameFetchUrl: function(id) {
      id = id || uiFieldMap.displayId;
      return serviceUrls.displayNameFetchUrl.replace("DISPLAY_ID", id);
    },

    assemblePlatformDetailsUrl: function(id) {
      id = id || uiFieldMap.displayId;
      return serviceUrls.setPlatformDetailsUrl.replace("DISPLAY_ID", id);
    },

    setUIValues: function(valuesObj) {
      for (var prop in valuesObj) {
        uiFieldMap[prop] = valuesObj[prop];
      }
    },

    getUIValues: function() { return uiFieldMap; },

    clearUIStatus: function() {
      uiStatus.severity = null; uiStatus.message = null;
    },

    setUIStatus: function(status) {
      uiStatus.severity = status.severity; uiStatus.message = status.message;
    },

    setDimensions: function(dim) {
      dimensions.width = dim.width; dimensions.height = dim.height;
    },

    setUIFieldMapObserver: function(fn) {
      Object.observe(uiFieldMap, fn);
    },

    setUIStatusObserver: function(fn) {
      Object.observe(uiStatus, fn);
    }
  };
};
