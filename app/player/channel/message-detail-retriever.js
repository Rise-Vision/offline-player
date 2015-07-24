module.exports = function(platformIO, serviceUrls) {
  return {
    getMessageDetail: function(messageId) {
      return getDisplayIdFromLocalStorage()
        .then(function(displayId) {
          return generateMessageDetailRequestUrl(displayId, messageId);
        })
        .then(requestMessageDetail);
    }
  };

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

  function generateMessageDetailRequestUrl(displayId, messageId) {
    console.log("generateMessageDetailRequestUrl", displayId, messageId);
    return Promise.resolve(serviceUrls.setPlatformDetailsUrl
            .replace("DISPLAY_ID", displayId) + "&ticket=" + messageId);
  }

  function requestMessageDetail(messageDetailsUrl) {
    console.log("requestMessageDetail", messageDetailsUrl);
    return platformIO.httpFetcher(messageDetailsUrl, {credentials: "include"})
    .then(function(resp) {
      return resp.json();
    });
  }
};
