# Offline Player
## Introduction

This is a chrome app designed to run presentations locally as part of the [Rise Vision](http://www.risevision.com) platform..

## Built With

- [NPM](http://www.npmjs.org)
- [Browserify](http://www.browserify.org)
- [Mocha](http://www.mochajs.org)

## Development 

### Local Development Environment Setup and Installation
 - Download and unzip SonarQube http://dist.sonar.codehaus.org/sonarqube-5.1.zip
 - Add sonarqube-5.1/bin/[platform] to path
 - Download and unzip sonar-runner http://repo1.maven.org/maven2/org/codehaus/sonar/runner/sonar-runner-dist/2.4/sonar-runner-dist-2.4.zip
 - Add sonar-runner-2.4 to path
 - Download javascript plugin http://dist.sonarsource.com/oss/org/codehaus/sonar-plugins/javascript/sonar-javascript-plugin/2.5/sonar-javascript-plugin-2.5.jar
 - Add sonar-javascript-plugin-2.5.jar to sonarqube-5.1/extensions/plugins
 - npm install -g istanbul
 - npm install -g browserify
 - npm install -g mocha
 - npm install
 - npm run unittest
 - npm run integration

Note that tests require [Chromedriver](http://chromedriver.storage.googleapis.com/index.html) to be available in your path and that google-chrome is installed.

Tests should be run after any save to any relevant file.  This can be accomplished with a file watcher that is set to run `npm run test` whenever a file changes.  For example, using the excellent [entr](http://entrproject.org/):
```bash
find app/player test -iname "*.js" |entr -c sh -c 'npm run test; \
if [ $(jq ".issues |length" .sonar/sonar-report.json) -ne "0" ];then \
google-chrome .sonar/issues-report/issues-report.html;fi'
```
## Submitting Issues 

Issues should be reported in the github issue list at https://github.com/Rise-Vision/offline-player/issues  

Issues should be reported with the template format as follows:

**Reproduction Steps**
(list of steps)
1. step 1
2. step 2

**Expected Results**
(what you expected the steps to produce)

**Actual Results**
(what actually was produced by the app)

Screenshots are always helpful with issues. 


## Contributing

All contributions greatly appreciated and welcome! If you would first like to sound out your contribution ideas please post your thoughts to our community (http://community.risevision.com), otherwise submit a pull request and we will do our best to incorporate it

## Resources

If you have any questions or problems please don't hesitate to join our lively and responsive community at http://community.risevision.com.

If you are looking for user documentation on Rise Vision please see http://www.risevision.com/help/users/

If you would like more information on developing applications for Rise Vision please visit http://www.risevision.com/help/developers/. 

**Facilitator**

[Tyler Johnson](https://github.com/tejohnso "Tyler Johnson")
