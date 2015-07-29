module.exports = function(rebootRestartProvider) {
  return {
    handles: function(evt) {
      return evt.player && evt.player.rebootRequired === "true";
    },

    process: function(evt) {
      console.log("Rebooting");
      logger.external("reboot");
      
      return rebootRestartProvider.reboot().catch(function() {
        console.log("Restarting instead");
        logger.external("restart after failed reboot");

        rebootRestartProvider.restart();
      });
    }
  };
};
