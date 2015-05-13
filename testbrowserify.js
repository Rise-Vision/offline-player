(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
  function background(chrome, screen) {
    chrome.app.runtime.onLaunched.addListener(onLaunchListener);

    function onLaunchListener() {
      var windowOptions = { state: "fullscreen" },
          windowPath="player/main/main-chrome-app-window.html";

      chrome.app.window.create(windowPath, windowOptions);

      showOptionsMenu();
    }

    function showOptionsMenu() {
      var screenWidth = screen.availWidth,
      screenHeight = screen.availHeight;

      var boundsSpecification = {
        width: Math.round(screenWidth * 2/4),
        height: Math.round(screenHeight * 2/4),
        left: Math.round(screenWidth * 1/4),
        top: Math.round(screenHeight * 1/4)
      };

      chrome.app.window.create("player/options/options-page.html",
      {
        id: "options-win",
        alwaysOnTop: true,
        outerBounds: boundsSpecification
      });
    }
  }

  if (typeof module === "undefined") {
    background(chrome, screen);
  } else {
    module.exports = background;
  }
}());

},{}]},{},[1]);
