"use strict";

module.exports = function(test, driverObj) {
  test.it("should fetch and set data", function() {

    driverObj.driver.wait(function() {
      return driverObj.driver.executeScript(function() {
        return chrome.app.window.getAll().length === 2;
      });
    }, 2000);

    driverObj.driver.getAllWindowHandles().then(function(arr) {
      driverObj.driver.switchTo().window(arr[2]);
    });

    driverObj.driver.findElement({id: "claimId"}).sendKeys("test_display");
  });
};
