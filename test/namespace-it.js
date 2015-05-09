"use strict";

module.exports = function(test, driverObj) {
  test.it("should have the namespace", function() {
    driverObj.driver.wait(function() {
      return driverObj.driver.executeScript(function() {
        return $rv !== undefined;
      });
    }, 2000);
  });
};
