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
    var windowHandle;

    driverObj.driver.sleep(1000);
    driverObj.driver.getAllWindowHandles().then(function(arr) {
      windowHandle = arr[1];
    });

    driverObj.driver.controlFlow().execute(function() {
      console.log("Changing to window " + windowHandle);
      driverObj.driver.switchTo().window(windowHandle);
    });

    driverObj.driver.findElement({"id": "mainChromeAppBody"});
  });

  require("./basic-it.js")(test, driverObj);
  require("./namespace-it.js")(test, driverObj);
  require("./schedule/local-schedule-loader-it.js")(test, driverObj);
  require("./schedule/schedule-it.js")(test, driverObj);

  test.after(function() {
    driverObj.driver.quit();
  });
});
