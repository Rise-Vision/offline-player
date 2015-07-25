module.exports = function(platformProvider) {
  return {
    handles: function(evt) {
      return evt.player && evt.player.restartRequired === "true";
    },

    process: function(evt) {
      console.log("Restarting", platformProvider);
      logger.external("restart");
      return platformProvider.restart();
    }
  };
};
