module.exports = function(rebootRestartProvider) {
  return {
    handles: function(evt) {
      return evt.player && evt.player.rebootRequired === "true";
    },

    process: function(evt) {
      console.log("Rebooting");
      return logger.external("reboot/restart via channel")
      .then(function() {
        return rebootRestartProvider.reboot();
      })
      .catch(function() {
        rebootRestartProvider.restart();
      });
    }
  };
};
