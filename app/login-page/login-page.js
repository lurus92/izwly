//#region Initial declarations

var app = require( "application" );
var view = require("ui/core/view");
var buttonModule = require("ui/button");
var platform = require("platform");
var absoluteLayoutModule = require("tns-core-modules/ui/layouts/absolute-layout");
var animationModule = require("tns-core-modules/ui/animation");
imagepicker = require("nativescript-imagepicker");
var frameModule = require("ui/frame");
var fs = require("file-system");
var imageSourceModule = require("image-source");
var userID = null;
var isFirstStart = true;

firebase = require("nativescript-plugin-firebase");
WIDTH = platform.screen.mainScreen.widthDIPs
HEIGHT = platform.screen.mainScreen.heightDIPs

//#endregion

//#region Function returning a sequence of numbers from a phone number (eliminating spaces, brackets, etc.)
function sanitizePhoneNumber(number){
  return number.match(/\d+/g).join('');
}

//#endregion

//#region Function in order to navigate to the main screen
function navigateToMainScreen(){

  console.log("starting to go in main screen");
    var topmost = frameModule.topmost();
    var navigationEntry = {
        moduleName: "main-page/main-page",
        backstackVisible: false,
        clearHistory: true
    };
    topmost.navigate(navigationEntry);
}

//#endregion 

//#region Global variables to perform testing [TO DELETE in production]
navTo2 = navigateToMainScreen;
photoselected = null;
imagesource = null;
profilePhotoUrl = null;
pb = null;
//#endregion

//#region Function in order to navigate to the login screen (used to go back to self)
function navigateToLoginScreen(){
  console.log("starting to go in login screen");
    var frameModule = require("ui/frame");
    var topmost = frameModule.topmost();
    var navigationEntry = {
        moduleName: "login-page/login-page",
        backstackVisible: false,
        clearHistory: true
    };
    return topmost.navigate(navigationEntry);
}

//#endregion

//#region Firebase listener understanding automatic logins [TO IMPLEMENT]
/*var listener = {
    onAuthStateChanged: function(data) {
      console.log(data.loggedIn ? "Logged in to firebase" : "Logged out from firebase");
      if (data.loggedIn) {
        navigateToMainScreen();
      }
    },
    thisArg: this
  };
*/
//firebase.addAuthStateListener(listener);

//#endregion



//#region Main UI builder. This is the entry point of this script
function buildDynamicUI(args) {
    
  var emulator = true; //Change this if you want to build this in production
  var page = args.object;
  var infoLabel = view.getViewById(page, "long-text");
  infoLabel.textWrap = true;
  var ratesLabel = view.getViewById(page, "long-text");
  ratesLabel.textWrap = true;

  console.log(args);

  var photoButton = view.getViewById(page, "photo-button");
  pb = photoButton;
  if (photoselected) photoButton.backgroundImage = profilePhotoUrl;
  /*
  var logoutButton = view.getViewById(page, "logout-button");
  logoutButton.on(buttonModule.Button.tapEvent, function(event){
      firebase.logout();
  });
  */
  globalVar = null;
  toccato = 0;
  list = new Array();
  var context = imagepicker.create({ mode: "multiple" });
  
    function startSelection(context, returnPage) {
      context
          .authorize()
          .then(function () {
          list = [];
          return context.present();
      })
          .then(function (selection) {
          console.log("Selection done:");
          selection.forEach(function (selected) {
            
              selected.getImage().then(function(imagesource){
                  //imagesource = r;
                  var folder = fs.knownFolders.documents();
                  var path = fs.path.join(folder.path, "profile.png");
                  var saved = imagesource.saveToFile(path, "png");
                  profilePhotoUrl = path;
              });

              //console.log("uri: " + selected.uri);
              //uri = selected.uri;
              var topmost = frameModule.topmost();
              photoselected = true;
              //photoButton.backgroundColor = "#3489db";
              isFirstStart = false;
              topmost.navigate(returnPage);
              animateScreen();
              
          });
          list = selection;
      }).catch(function (e) {
          console.log(e);
      });
  }

  photoButton.on(buttonModule.Button.tapEvent, function(){
    var topmost = frameModule.topmost();    
    var startPage = topmost.currentEntry;
    var context = imagepicker.create({ mode: "single" });
    startSelection(context, startPage);
   /* toccato++;
    //globalVar = context;

    context
    .authorize()
    .then(function() {
        return context.present();
    })
    .then(function(selection) {
        selection.forEach(function(selected) {
           //alert("uri: " + selected.uri); 
           console.log("selected element");
           console.log(this);         
        });
        this.items = selection;
        console.log("selection finished")
        //this._changeDetectionRef.detectChanges();
        /*if (selection.length > 0) {
          alert(selection[selection.length-1].uri);
        }
    }).catch(function (e) {
        alert(e);
    });*/
  });


  function wrapGetCurrentUser(){
    firebase.getCurrentUser().then(
      function (result) {
        alert(JSON.stringify(result));

      },
      function (errorMessage) {
        alert(errorMessage);
      }
    );
  }
        
        
        /*signupButton.on(buttonModule.Button.tapEvent, function (event) {
        var frameModule = require("ui/frame");
        var topmost = frameModule.topmost();
        
        var navigationEntry = {
            moduleName: "main-page/main-page",
            backstackVisible: false,
            clearHistory: true
        };
        topmost.navigate(navigationEntry);
    },signupButton);*/

    var phoneNumberTextField = view.getViewById(page, "number-textfield");
    //var codeTextField = view.getViewById(page, "code-textfield");
    var topLayout = view.getViewById(page, "top-container");
    var mainView = view.getViewById(page, "main-container");    
    var smsButton = view.getViewById(page, "sms-button");
    //var title = view.getViewById(page, "title");
   // console.log("w: "+WIDTH/2+" h: "+HEIGHT/2+" bw: "+smsButton.width/2+" bh: "+smsButton.height/2);
    absoluteLayoutModule.AbsoluteLayout.setLeft(smsButton, WIDTH/2 - smsButton.width/2);
    absoluteLayoutModule.AbsoluteLayout.setTop(smsButton, HEIGHT*0.6 - smsButton.height+8);
    absoluteLayoutModule.AbsoluteLayout.setTop(topLayout, 0);
      

    //smsButton.setTop(view, topLayout.getMeasuredHeight()/2);
    var firstStepResultalert = null;
    smsButton.on(buttonModule.Button.tapEvent, function(event){
        phoneNumber = phoneNumberTextField.text; 
        if (!phoneNumber) {
          alert("Please insert a valid phone number");
          return;
        }
        phoneNumber = sanitizePhoneNumber(phoneNumber);
        //alert("SONO PARTITO");       
        //alert(number);
        if (!emulator){
          firebase.login({
              type: firebase.LoginType.PHONE,
              phoneOptions: {
                phoneNumber: number,
                verificationPrompt: "The received verification code" // default "Verification code"
              }
            }).then(
                function (result) {
                  console.log("phone login succeed");
                  console.log(JSON.stringify(result));
                  userID = result.uid;
                  //alert(JSON.stringify(result));
                  animateScreen();
                  
                  /*signupButton.on(buttonModule.Button.tapEvent, function(){
                      //alert(JSON.stringify(firebase.getCurrentUser()));
                      var code = codeTextField.text;
                      firstStepResult.confirm(code).then(function (secondStepresult) {
                          console.log("verification successful");
                          console.log(secondStepresult);
                          // User signed in successfully.
                          var user = secondStepresult.user;
                          navigateToMainScreen();
                        }).catch(function (error) {
                          alert(error)
                        });
                  });*/
                },
                function (errorMessage) {
                  console.log(errorMessage);
                }
            );
        }else{
          console.log("Starting anonymous login");
          firebase.login({
            type: firebase.LoginType.ANONYMOUS
          }).then(
              function (user) {
                //console.log(user.uid);
                console.log(JSON.stringify(user));
                console.log(user.uid);
                userID = user.uid;
                animateScreen();
                              
                /*mainView.animate({
                  translate: { x: 0, y: -HEIGHT},
                  duration: 300
                });*/


              },
              function (errorMessage) {
                alert(JSON.stringify(errorMessage));
              }
          );
        }


    });

    function animateScreen(){
      var topContainer = view.getViewById(page, "top-container");
      var bottomContainer = view.getViewById(page, "bottom-container");
      var smsButton = view.getViewById(page, "sms-button");
      definitions = new Array();      
      definitions.push({ target: topContainer, translate: { x: 0, y: -HEIGHT*0.8 }, duration: 300 });
      definitions.push({ target: bottomContainer, translate: { x: 0, y: -HEIGHT*0.5 }, duration: 300 });
      definitions.push({ target: smsButton, translate: { x: 0, y: -HEIGHT*0.8 }, duration: 300 });
      
      animationSet = new animationModule.Animation(definitions);
      animationSet.play().then(function () {
        console.log("Animation finished");
        })
          .catch(function (e) {
            console.log(e.message);
          }); 
    }

    var startButton = view.getViewById(page, "start-button");
    startButton.on(buttonModule.Button.tapEvent, function(event){
      if (!userID) { alert("User not correctly autenticated"); return;};
      var nameTextField = view.getViewById(page, "name-textfield");
      if (nameTextField.text == "" ){ alert("Choose a name"); return;}

      // now upload the file with either of the options below:
      firebase.uploadFile({
        // optional, can also be passed during init() as 'storageBucket' param so we can cache it (find it in the Firebase console)
        //bucket: 'gs://izwly-c6b98.appspot.com',
        // the full path of the file in your Firebase storage (folders will be created)
        remoteFullPath: 'uploads/images/profiles/'+userID+'.png',
        // option 1: a file-system module File object
        localFile: fs.File.fromPath(profilePhotoUrl),
        // option 2: a full file path (ignored if 'localFile' is set)
        localFullPath: profilePhotoUrl,
        // get notified of file upload progress
        onProgress: function(status) {
          console.log("Uploaded fraction: " + status.fractionCompleted);
          console.log("Percentage complete: " + status.percentageCompleted);
        }
      }).then(

          function (uploadedFile) {
            console.log("File uploaded: " + JSON.stringify(uploadedFile));
            firebase.updateProfile({
              displayName: nameTextField.text,
              photoURL: uploadedFile.url
            }).then(
                function (result) {
                  firebase.setValue("/users/"+phoneNumber,
                  {
                    "name": nameTextField.text,
                    "id": userID
                  }).then(function(){
                    console.log("Profile correctly created");
                    console.log(JSON.stringify(result));
                    navigateToMainScreen();
                  });

                },
                function (errorMessage) {
                  console.log(errorMessage);
                }
            );
          },
          function (error) {
            console.log("File upload error: " + error);
          }
      );

      /*firebase.updateProfile({
        displayName: nameTextField.text,
        photoURL: 'http://provider.com/profiles/eddyverbruggen.png'
      }).then(
          function () {
            // called when update profile was successful
          },
          function (errorMessage) {
            console.log(errorMessage);
          }
      );   */
    });   
    
}

//#endregion

exports.buildDynamicUI = buildDynamicUI; 