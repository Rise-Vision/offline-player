chrome.app.runtime.onLaunched.addListener(onLaunchListener);

function onLaunchListener() {
  var windowOptions = { state: "fullscreen" },
      windowPath="player/main/main-window.html";

  chrome.app.window.create(windowPath, windowOptions);
  
  // Get GCM registration id
  chrome.storage.local.get("gcmRegistrationId", function(result) {
    var gcmProjectId = "642011540044";
    
    if (!result.gcmRegistrationId) {
      chrome.gcm.register([gcmProjectId], function(registrationId) {
        if (chrome.runtime.lastError) {
          console.log("Registration failed", chrome.runtime.lastError);
        }
        else {
          chrome.storage.local.set({ gcmRegistrationId: registrationId });
        }
      });
    }
  });
}
