module.exports = function(platformProvider) {
  return {
    handles: function(evt) {
      return evt.player && evt.player.rebootRequired === "true";
    },

    process: function(evt) {
      console.log("Rebooting");
      logger.external("reboot");
      
      return platformProvider.reboot().catch(function() {
        console.log("Restarting instead");
        logger.external("restart after failed reboot");

        platformProvider.restart();
      });
    }
  };
};
