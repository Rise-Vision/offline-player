"use strict";

var useLiveTest = false;

module.exports = {
  setPlatformDetailsUrl: "http://localhost:7654/setPlatformDetailsUrl",

  scheduleFetchUrl: "http://localhost:7654/scheduleFetchUrl",

  displayNameFetchUrl: "http://localhost:7654/displayNameFetchUrl",

  registrationUrl: "http://localhost:7654/registrationUrl",

  folderContentsUrl: !useLiveTest ? "http://localhost:7654/folderContentsUrl" : 
                                    "https://storage-dot-rvacore-test.appspot.com" +
                                      "/_ah/api/storage/v0.01/getFolderContents?" +
                                      "companyId=COMPANY_ID&folderName=FOLDER_NAME&useSignedURIs=false",

  registerTargetUrl: "http://localhost:7654/registerTargetUrl",

  ipAddressResolver: "http://localhost:7654/ipAddress",

  externalLogAuthRefresh: "http://localhost:7654/authRefresh",

  externalLog: "http://localhost:7654/event",

  tokenServerUrl: "http://localhost:7654/channelToken"
};
