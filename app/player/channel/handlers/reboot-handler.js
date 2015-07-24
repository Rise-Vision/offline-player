module.exports = function(platformProvider) {
  return {
    handles: function(evt) {
      return evt.player && evt.player.rebootRequired === "true";
    },

    process: function(evt) {
      console.log("Rebooting");
      return platformProvider.reboot().catch(function() {
        console.log("Restarting instead");
        platformProvider.restart();
      });
    }
  };
};
