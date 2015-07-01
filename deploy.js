var spawnSync = require("child_process").spawnSync,
fs = require("fs"),
credentialsPath = "private-keys/offline-player/oauth-credentials.json",
utf8 = function() {return {encoding: "utf8"};};

(function incrementPatchVersion() {
  var manifestFilePath = "app/manifest.json";

  manifest = JSON.parse(fs.readFileSync("app/manifest.json", utf8()));
  version = manifest.version;
  lastDot = manifest.version.lastIndexOf(".");
  patchVer = parseInt(manifest.version.substr(lastDot + 1, 10));
  version = manifest.version.substr(0, lastDot) + "." + (patchVer + 1);
  manifest.version = version;

  fs.writeFileSync
  (manifestFilePath, JSON.stringify(manifest, null, 2), utf8());
}());

console.log(spawnSync("git", ["add", "manifest.json"]).stdout.toString());
console.log(spawnSync("git", ["-m", "increment version"]).stdout.toString());
console.log(spawnSync("git", ["commit"]).stdout.toString());
console.log(spawnSync("git", ["push"]).stdout.toString());

zip = spawnSync("zip", ["-r", "app", "app"], utf8());
console.log(zip.stdout);

credentials = JSON.parse(fs.readFileSync(credentialsPath, utf8()));

accessTokenRequest = spawnSync("curl", ["--data",
"refresh_token=" + credentials.refresh_token +
"&client_id=" + credentials.client_id +
"&client_secret=" + credentials.client_secret +
"&grant_type=refresh_token",
"https://www.googleapis.com/oauth2/v3/token"], utf8());

accessToken = JSON.parse(accessTokenRequest.stdout).access_token;

console.log("Deploying...");

chromeWebStoreRequest = spawnSync("curl", [
"-H", "Authorization: Bearer " + accessToken, 
"-H", "x-goog-api-verison: 2",
"-X", "PUT",
"-T", "app.zip",
"-vv",
"https://www.googleapis.com/upload/chromewebstore/v1.1/items/" + credentials.app_id]);

console.log(JSON.parse(chromeWebStoreRequest.stdout.toString()).uploadState);

if (chromeWebStoreRequest.stdout.toString().indexOf("FAILURE") > -1) {
  process.exit(1);
}
