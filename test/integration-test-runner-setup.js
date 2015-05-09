"use strict";
var isWindows = /^win/.test(process.platform),
    webdriver = require("selenium-webdriver"),
    chromeClient = require("selenium-webdriver/chrome"),
    chromeOptions = new chromeClient.Options(),
    test = require("selenium-webdriver/testing");

if(isWindows) {
  var x86Path = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  var x64Path = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

  if(fs.existsSync(x86Path)) {
    chromeOptions.setChromeBinaryPath(x86Path);
  } else {
    chromeOptions.setChromeBinaryPath(x64Path);
  }
} else {
  chromeOptions.setChromeBinaryPath("/usr/bin/google-chrome");
}

chromeOptions.addArguments("--disable-web-security");
chromeOptions.addArguments("--load-and-launch-app=./app");

module.exports.webdriver = webdriver;
module.exports.chromeOptions = chromeOptions;
module.exports.test = test;
