module.exports = function() {
  return {
    createListener: function(hash) {
      return function(fetchDetails) {
        return {redirectUrl: "redirection-for-" + fetchDetails};
      };
    }
  };
};
