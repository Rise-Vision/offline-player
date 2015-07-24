module.exports = function(platformProvider) {
  return {
    handles: function(evt) {
      return evt.data.player && evt.data.player.rebootRequired === "true";
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
