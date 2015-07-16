module.exports = function(platformInfo, bqCredentials) {
  return {
    setPlatformDetailsUrl: "https://rvacore-test.appspot.com" +
    "/v2/viewer/display/DISPLAY_ID?os=" + platformInfo.basePlatform +
    "&cv=" + platformInfo.version +
    "&cn=" + platformInfo.name +
    "&pv=" + platformInfo.baseVersion +
    "&pn=" + platformInfo.baseName,

    scheduleFetchUrl: "https://rvacore-test.appspot.com" +
    "/v2/viewer/display/DISPLAY_ID?nothing",

    displayNameFetchUrl: "https://rvacore-test.appspot.com/_ah/api/content/v0/display?id=DISPLAY_ID",

    registrationUrl: "https://rvacore-test.appspot.com" +
    "/v2/viewer/display/CLAIM_ID/register?" +
    "width=WIDTH&height=HEIGHT&name=NAME",

    folderContentsUrl: "https://storage-dot-rvacore-test.appspot.com" +
    "/_ah/api/storage/v0.01/getFolderContents?" +
    "companyId=COMPANY_ID&folderName=FOLDER_NAME&useSignedURIs=false",

    registerTargetUrl: "https://storage-dot-rvacore-test.appspot.com" +
    "/_ah/api/storage/v0.01/registerGCMTargetList?" +
    "gcmClientId=GCM_CLIENT_ID",

    ipAddressResolver: "http://ident.me",

    externalLogAuthRefresh: "https://www.googleapis.com/oauth2/v3/token" +
    "?client_id=" + bqCredentials.client_id +
    "&client_secret=" + bqCredentials.client_secret +
    "&refresh_token=" + bqCredentials.refresh_token +
    "&grant_type=refresh_token",

    externalLog: "https://www.googleapis.com/bigquery/v2/projects" +
    "/client-side-events/datasets/OLP_Events/tables/TABLE_ID/insertAll" 
  };
};
