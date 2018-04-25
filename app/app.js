/*
In NativeScript, the app.js file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/

require("./bundle-config");
var application = require("application");
var firebase = require("nativescript-plugin-firebase");


firebase.init({
  // Optionally pass in properties for database, authentication and cloud messaging,
  // see their respective docs.
  iOSEmulatorFlush: true,    
  storageBucket: 'gs://izwly-c6b98.appspot.com'
}).then(
    function (instance) {
      alert("firebase.init done");
    },
    function (error) {
      alert("firebase.init error: " + error);
    }
);
//application.start({ moduleName: "main-page" });
if (application.ios) {
    var fontModule = require("ui/styling/font");
    //fontModule.ios.registerFont("Pacifico-Regular.ttf");

}

application.start({ moduleName: "welcome-page/welcome-page" });

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
