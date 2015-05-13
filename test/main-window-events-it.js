"use strict";

module.exports = function(test, driverObj) {
  test.it("should open the options menu on click", function() {
    driverObj.driver.wait(function() {
      return driverObj.driver.executeScript(function() {
        document.getElementById("mainChromeAppBody").click();
        return chrome.app.window.getAll().length === 2;
      });
    }, 2000);
  });
};

