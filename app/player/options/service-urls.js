module.exports = function(platformDescription) {
  return {
    setPlatformDetailsUrl: "https://rvacore-test.appspot.com" +
    "/v2/viewer/display/DISPLAY_ID?os=" +
    platformDescription +
    "&cv=" + navigator.appVersion.match(/Chrome\/([0-9.]*)/)[1] +
    "&cn=Chrome&pv=0.0.1&pn=OfflinePlayer",

    scheduleFetchUrl: "https://rvacore-test.appspot.com" +
    "/v2/viewer/display/DISPLAY_ID?nothing",

    displayNameFetchUrl: "https://rvacore-test.appspot.com/_ah/api/content/v0/display?id=DISPLAY_ID",

    registrationUrl: "https://rvacore-test.appspot.com" +
    "/v2/viewer/display/CLAIM_ID/register?" +
    "width=WIDTH&height=HEIGHT&name=NAME",

    folderContentsUrl: "https://storage-dot-rvacore-test.appspot.com" +
    "/_ah/api/storage/v0.01/getFolderContents?" +
    "companyId=COMPANY_ID&folderName=FOLDER_NAME&useSignedURIs=false"
  };
};
