module.exports = function(platformProvider) {
  return {
    handles: function(evt) {
      return evt.data.player && evt.data.player.restartRequired === "true";
    },

    process: function(evt) {
      console.log("Restarting");
      return platformProvider.restart();
    }
  };
};
