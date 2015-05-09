"use strict";

module.exports = function(test, driverObj) {
  test.it("should have the schedule loader", function() {
    driverObj.driver.wait(function() {
      return driverObj.driver.executeScript(function() {
        return $rv.localScheduleLoader !== undefined;
      });
    }, 2000);
  });

  test.it("should load a schedule", function() {
    driverObj.driver.manage().timeouts().setScriptTimeout(10000);

    driverObj.driver.wait(function() {
      return driverObj.driver.executeAsyncScript(function() {
        var asyncDoneFunction = arguments[arguments.length - 1],
        intervalHandler;

        intervalHandler = setInterval(function() {
          if ($rv.schedule.scheduleData) {
            asyncDoneFunction(true);
          }
        }, 300);
      });
    }, 2000);
  });
};
