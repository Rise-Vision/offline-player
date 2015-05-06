"use strict";
var setup = require("./test-setup.js"),
    test = setup.test,
    webdriver = setup.webdriver,
    chromeOptions = setup.chromeOptions;

test.describe("offline player", function() {
  var driver;

  test.before(function() {
    driver = new webdriver.Builder().forBrowser("chrome")
    .setChromeOptions(chromeOptions)
    .build();
  });

  test.it("should create a window", function() {
    var windowHandle;

    driver.sleep(1000);
    driver.getAllWindowHandles().then(function(arr) {
      windowHandle = arr[1];
    });

    driver.controlFlow().execute(function() {
      console.log("Changing to window " + windowHandle);
      driver.switchTo().window(windowHandle);
    });

    driver.findElement({"id": "mainChromeAppBody"});
  });

  test.after(function() {
    driver.quit();
  });
});
