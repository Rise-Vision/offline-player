"use strict";

module.exports = function(test, driverObj) {
  test.it("basic integration test after switching to app window", function() {
    driverObj.driver.wait(function() {
      return driverObj.driver.executeScript(function() {
        return chrome.app.window !== undefined;
      });
    }, 2000);
  });
};
