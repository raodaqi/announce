var appJs = require("cloud/app.js");
// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
AV.Cloud.define("getData", function(request, response) {
  console.log('Log in timer.');
  // appJs.cronGetData();
  appJs.getCUITImportentData();
  appJs.getJWCImportentData();
  response.success("Log in timer.");
});
