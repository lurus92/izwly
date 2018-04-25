var app = require( "application" );
var contacts = require( "nativescript-contacts" );
var view = require("ui/core/view");
var layout = require("ui/layouts/grid-layout");
var buttonModule = require("ui/button");
var labelModule = require("ui/label");
var gestures = require("ui/gestures");
firebase = require("nativescript-plugin-firebase");


onQueryEvent = function(result) {
    // note that the query returns 1 match at a time
    // in the order specified in the query
    if (!result.error) {
        console.log("Event type: " + result.type);
        console.log("Key: " + result.key);
        console.log("Value: " + JSON.stringify(result.value));
    }
};

function buildDynamicUI(args) {
        
    var page = args.object;
    buildStories(page);
    buildContactList(page);
    
}

function buildStories (page){
    var storiesContainer = view.getViewById(page, "stories-container");
    for (var i=0; i<10; i++){
        var story = new buttonModule.Button();
        story.className = "story-button";
        story.identifier = i;
        storiesContainer.addChild(story);
        story.on(buttonModule.Button.tapEvent, function (event) {
            alert("You touched element: "+this.identifier);
        },story);
    }

}


function buildContactList(page){
    var contactsContainer = view.getViewById(page, "contacts-container");
    var contactFields = ['name','phoneNumbers'];
    contacts.getAllContacts(contactFields).then(function(args){
        if (!args.data) console.log("No contacts!");   //TODO: improve this
        console.log("Found "+args.data.length+" contacts");
        // Iterate over all contacts
        for (var i=0; i<args.data.length; i++){  //TODO: Check if args.data exists

            //Build list UI
            var StackLayout = require("ui/layouts/stack-layout").StackLayout;
            var contactListElement = new StackLayout();
            contactListElement.orientation = "horizontal";
            var nameLabel = new labelModule.Label()
            var name = JSON.stringify(args.data[i].name)
            nameLabel.text = buildNameFromJSON(args.data[i].name);          //TODO: Improve buildNamFromJSON

            var contactImage = new buttonModule.Button();                //TODO: all these attributes should be of the list element
            contactListElement.name = JSON.stringify(args.data[i].name);
            contactImage.className = "contact-button";
            contactListElement.phoneNumber = args.data[i].phoneNumbers[0].value;
            contactListElement.presentInApp = null;
            contactListElement.on(gestures.GestureTypes.tap, function (event) {
                //A contact has been tapped. I should start a new conversation
                startConversation(this);
            },contactListElement);

            //contactsContainer.addChild(contact);
            contactListElement.addChild(contactImage);
            contactListElement.addChild(nameLabel);
            contactsContainer.addChild(contactListElement);

            // The graphical element has been created. Now I want to enrich it using firebase

            firebase.query(
                function(result){
                    if (!result.error) {
                        //console.log("Event type: " + result.type);
                        console.log("Key: " + result.key);
                        console.log("Value: " + JSON.stringify(result.value));
                        if (result.value){
                            z = contactImage;
                            //The contact is present in firebase remote db. In result.value we have the uid, that we can use to access to the image, for example
                            // init the file-system module
                            var fs = require("file-system");
                            var userID = result.value.id;
                            // let's first determine where we'll create the file using the 'file-system' module
                            var documents = fs.knownFolders.documents();
                            //console.log("here");                            
                            var logoPath = fs.path.join(documents.path, userID + ".png");   
                            
                            //var logoPath = documents.path + userID;
                            // this will create or overwrite a local file in the app's documents folder
                            var localLogoFile = documents.getFile(userID + ".png");
                              // now download the file with either of the options below:
                            console.log("start to download image");
                            firebase.downloadFile({
                                // the full path of an existing file in your Firebase storage
                                remoteFullPath: 'uploads/images/profiles/'+userID+'.png',
                                // option 1: a file-system module File object
                                localFile: fs.File.fromPath(logoPath),
                                // option 2: a full file path (ignored if 'localFile' is set)
                                localFullPath: logoPath
                            }).then(
                                function (downloadedFile) {
                                    console.log("image downloaded");
                                    //console.log("Downloaded file: "+ downloadedFile);
                                    //console.log("Local URL: "+logoPath);
                                    //contactImage.backgroundImage = 'uploads/images/profiles/'+userID+'.png';
                                    contactImage.backgroundImage = logoPath;
                                    contactImage.borderWidth = 0;
                                    contactListElement.presentInApp = true;
                                },
                                function (error) {
                                    console.log("File download error: " + error);
                                }
                            );
                            //contactImage.backgroundColor = "red";
                        }else{
                            contactListElement.presentInApp = false;
                        }

                    }
                },

                "/users/"+sanitizePhoneNumber(contactListElement.phoneNumber),
                {
                    singleEvent: true,
                    orderBy: {
                    type: firebase.QueryOrderByType.KEY
                    },
                    limit: {
                    type: firebase.QueryLimitType.FIRST,
                    value: 1
                    }
                }).then(function(result){
                        //alert(result);
                }).catch(function(error){
                    console.error(error);   
                });
        }

    }, function(err){
        console.log("Error: " + err);
    });
}

function startConversation(element){
    console.log(element);
    if (typeof(element.presentInApp) == "undefined"){
        alert("We don't know if the user is present in the remote database. It is needed to perform a query with this user and get its state.");
    }else{
        if (!element.presentInApp){
            alert("User not present in the remote database. We will have to send an invitation."); 
        }else{
            alert("Usert present in the app. Proceed to send the message.");
        }
    }
}

function sanitizePhoneNumber(number){
    return number.match(/\d+/g).join('');
}


function buildNameFromJSON(nameJSON){
    var name = "";
    for(var i in nameJSON)
            if (nameJSON[i] && typeof(nameJSON[i])!="object")     // To improve here 
            name = name + nameJSON[i] + " ";
    return name;
}

/*

function buildConversationList(data){
    //We expect data as a JSON string
    var conversations = JSON.parse(data);
    for (var i=0; i<conversations.length; i++)

}
*/
exports.buildDynamicUI = buildDynamicUI; 