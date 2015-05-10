"use strict";

module.exports = function(test, driverObj) {
  test.it("should have the schedule loader", function() {
    driverObj.driver.wait(function() {
      return driverObj.driver.executeScript(function() {
        return $rv.localScheduleLoader !== undefined;
      });
    }, 2000);
  });
};
