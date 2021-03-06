"use strict";
var setup = require("./integration-test-runner-setup.js"),
    test = setup.test,
    webdriver = setup.webdriver,
    chromeOptions = setup.chromeOptions;

test.describe("integration suite", function() {
  var driverObj = {};

  test.before(function() {
    driverObj.driver = new webdriver.Builder().forBrowser("chrome")
    .setChromeOptions(chromeOptions)
    .build();
  });

  test.it("should create a window", function() {
    var mainElement;

    driverObj.driver.sleep(1000);
    driverObj.driver.getAllWindowHandles().then(function(arr) {
      driverObj.driver.switchTo().window(arr[3]);
    });

    mainElement = driverObj.driver.findElement({"id": "mainChromeAppBody"});
    driverObj.driver.wait(mainElement, 2500);
  });

  require("./basic-it.js")(test, driverObj);
  require("./schedule/schedule-handler-it.js")(test, driverObj);
  require("./main-window-events-it.js")(test, driverObj);
  require("./options/claim-id-click-listener-it.js")(test, driverObj);

  test.after(function() {
    driverObj.driver.quit();
  });
});
