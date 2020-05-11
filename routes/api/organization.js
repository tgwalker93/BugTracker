var path = require('path');
var request = require("request");
var express = require("express");
var app = express.Router();

//Database Models 
var Organization = require("../../db/models/organization.js");
var User = require("../../db/models/user.js");

//SAVE A Organization
app.post("/saveOrganization", function (req, res) {

    console.log("I'm in the save organization backend");
    console.log(req.body);
    // Create a new Organization and pass the req.body to the entry
    let result = {
        name: req.body.organizationName,
        organizationID: req.body.organizationID,
        userWhoCreatedOrgMongoID: req.body.mongoID
    }

    console.log(result);
    var newOrganization = new Organization(result);

    let filter = { organizationID: req.body.organizationID };

    console.log("Here is the filter");
    console.log(filter);

    Organization
        .findOne(filter, function (error, doc) {
            // Log any errors -- 
            if (error) {
                console.log("ERROR FOUND WHEN TRYING TO SEARCH ORGANIZATION!")
                console.log(error);
                let responseObj = {
                    error: "Server error."
                }
                res.json(responseObj);
            }
            // IF Organization IS NOT FOUND, then we an save the new organization, since organizationID MUST BE UNIQUE! 
            else if (doc === null) {
                // And save the new organization in the db
                newOrganization.save(function (error, doc) {
                    // Log any errors
                    if (error) {
                        console.log(error);
                    }
                    // Otherwise
                    else {
                        // Use the User id to find and update its' organization
                        User.findOneAndUpdate({ "_id": req.body.mongoID }, { $push: { "organizations": doc._id } },
                            { safe: true, upsert: true })
                            // Execute the above query
                            .exec(function (err, doc) {

                                console.log("Found USER AND UPDATED");
                                console.log(doc);
                                // Log any errors
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    // Or send the document to the browser
                                    res.send(doc);
                                }
                            });
                    }
                });
            } 
            else {
                //IF USER IS FOUND, WE SEND ERROR BACK SAYING ORGANIZATION ID IS TAKEN
                console.log("Organization is taken already");
                let responseObj = {
                    error: "Organization ID is taken already."
                }
                res.json(responseObj);
            }
        });

});

app.post("/updateOrganization", function(req, res) {
    console.log("i'm in the updateOrganization BACKEND");
    console.log(req.body);


    let filter = { _id: req.body.organizationMongoID };
    let options = {
        safe: true,
        upsert: false
    }

    let update = {
        name: req.body.organizationName,
        organizationID: req.body.organizationID
    };

    console.log(req.body.mongoID);

    Organization
        .findOneAndUpdate(filter, update, options)
        .then(function (doc, error) {
            // Log any errors
            if (error) {
                console.log("updateOrganization back-end failed!")
                console.log(error);
                res.json(error);
            }
            // Or send the doc to the browser as a json object
            else {
                console.log("updateOrganization back-end was successful!");
                console.log(doc);
                res.json(doc);
            }
        })
        .catch(err => res.status(422).json(err));
});

//Get all organizations of a user object
app.get("/getAllOrganizationsOfUser/:mongoID", function(req, res) { 
    console.log("i'm in the GET organizations BACK END");
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    console.log(req.params.mongoID);
    User.findOne({ "_id": req.params.mongoID })
        // ..and populate all of the bug comments associated with it
        .populate("organizations")
        // now, execute our query
        .exec(function (error, doc) {
            // Log any errors
            if (error) {
                console.log(error);
            }
            // Otherwise, send the doc to the browser as a json object
            else {
                res.json(doc);
            }
        });
});


//attach user to organization
app.post("/attachUserToOrganization", function (req, res) {
    console.log("i'm in the attachUserToOrganization BACK END");
    console.log(req.body);
    // Create a new Organization and pass the req.body to the entry
    let resultObj = {
        organizationID: req.body.organizationID,
        userMongoID: req.body.mongoID
    }

    console.log(resultObj);

    let filter = { organizationID: req.body.organizationID };

    console.log("Here is the filter");
    console.log(filter);

    Organization
        .findOne(filter, function (error, organizationDoc) {
            // Log any errors -- 
            if (error) {
                console.log("ERROR FOUND WHEN TRYING TO SEARCH ORGANIZATION!")
                console.log(error);
                let responseObj = {
                    error: true,
                    errorReason: "Server error."
                }
                res.json(responseObj);
            }
            // IF Organization IS NOT FOUND, then we send error back to client, unable to join organizaiton
            //organizationID MUST BE UNIQUE! 
            else if (organizationDoc === null) {
                console.log(error);
                let responseObj = {
                    error: "Cannot find Organization with that Organization ID"
                }
                res.json(responseObj);
            }
            else {
                //If the ORGANIZATION ID is found, then we will update that Organization.
                //We will update the Organization mongoID in the User Model's "organizations" array
               // Use the User id to find and update its' organization

               //First, if the user is already in the organization, we don't want the user to join again. So we will send error message back.
                //We want to search our database to see if this email is already taken.
                var filter = { _id: resultObj.userMongoID }
                User
                    .findOne(filter)
                    .then(function (userDoc, error) {
                        // Log any errors
                        if (error) {
                            console.log("getUserData back-end failed!")
                            console.log(error);
                            resultObj.error = "Something went wrong with finding the User.";
                            resultObj.errorObj = error;
                            res.json(resultObj);
                        }
                        else if (userDoc === null) {
                            //If no user is found, then something went wrong with the client.
                            resultObj.error = "No user found.";
                            res.json(resultObj);
                            console.log("NO USER HAS BEEN FOUND");
                        }
                        else {
                            //Once we find the user, we need to see if he already has this organization
                            var userAlreadyHasOrganization = false;
                            console.log("user doc organizations");

                            console.log(userDoc.organizations);
                            console.log("organization doc");
                            console.log(organizationDoc);
                            for(var i = 0; i<userDoc.organizations.length; i++){
                                console.log("searching for organizations");
                                console.log(userDoc.organizations[i]);
                                console.log("------ COMPARED WITH " + organizationDoc._id)
                                if (userDoc.organizations[i].toString() === organizationDoc._id.toString()){
                                    userAlreadyHasOrganization = true;
                                    console.log("IS TRUE");
                                }
                            }

                            //If user does NOT have organization already, then we can proceed with having him join it. 
                            if(!userAlreadyHasOrganization){
                                console.log("RIGHT BEOFRE I TRY TO UPDATE USER");
                                userDoc.organizations.push(organizationDoc._id);
                                // Now, save that entry to the db
                                userDoc.save(function (err, afterUserIsSavedDoc) {
                                    // Log any errors
                                    if (err) {
                                        console.log("OHH NO I HAVE AN ERORR");
                                        console.log(err);
                                        resultObj.error = "Something went wrong when trying to save the user";
                                        res.json(resultObj);
                                    }
                                   
                                    else {
                                        resultObj.successMessage = "You've successfully joined an organization.";
                                        console.log("successfully safed user to org");
                                        console.log(afterUserIsSavedDoc);
                                        resultObj.newUserObj = afterUserIsSavedDoc;
                                        resultObj.organizations = afterUserIsSavedDoc.organizations;
                                        res.json(resultObj);
                                    }
                                });

                            } else {
                                //Otherwise, we will officially send error messsage.
                                resultObj.error = "You have already joined that organization.";
                                res.json(resultObj);

                            }

                        }
                    })
                    .catch(err => res.status(422).json(err));
            }
        });

});


//Delete an Organization
app.post("/deleteOrganization", function (req, res) {
    console.log("i'm in the deleteOrganization BACK END");
    console.log(req.body);
    // Create a new Organization and pass the req.body to the entry
    let resultObj = {
        organizationMongoID: req.body.organizationMongoID,
        userMongoID: req.body.userMongoID,
        organization: req.body.organizationData,
        organizationAdminMongoID: req.body.organizationAdminMongoID,
        isUserOrganizationOwner: req.body.isUserOrganizationOwner
    }

    console.log(resultObj);




        var filter = { _id: resultObj.userMongoID}

        User.findOne({ "_id": resultObj.userMongoID })
            // ..and populate all of the organizations associated with it
            .populate("organizations")
            // now, execute our query
            .exec(function (error, userDoc) {
                // Log any errors
                if (error) {
                    console.log(error);
                }
                // Otherwise, send the doc to the browser as a json object
                else {
                    //res.json(doc);
                    console.log("FOUND USER");
                    console.log(userDoc);


                    // User.updateOne({ _id: resultObj.userMongoID }, { $pullAll: { _id: [resultObj.organizationMongoID] } })
                    User.findOneAndUpdate({ "_id": resultObj.userMongoID }, 
                    { $pullAll: { organizations: [resultObj.organizationMongoID] }},
                            { safe: true})
                        // Execute the above query
                        .exec(function (err, userDoc) {


                            // Log any errors
                            if (err) {
                                console.log(err);
                            }
                            else {
                                //Now that I updated the user...
                            //If user is organization owner, then we will remove the organization!!!
                                if (resultObj.isUserOrganizationOwner) {
                                    var filter = { _id: resultObj.organizationMongoID };
                                    Organization
                                        .deleteOne(filter, function (error, doc) {
                                            // Log any errors
                                            if (error) {
                                                console.log("organization deleted back-end failed!")
                                                console.log(error);
                                                resultObj.error = true;
                                                resultObj.errorObj = error;
                                                res.json(error);
                                            }
                                            // Or send the doc to the browser as a json object
                                            else {
                                                console.log("Organization delete back-end was successful!");
                                                //Deleting the bug was a success, now we need to make sure that remove the bug from the Organization doc in DB
                                                //TODO
                                                console.log(doc);

                                                resultObj.deletedOrganizationDoc = doc;
                                                resultObj.message = "The organization has been deleted.";
                                                res.json(resultObj);

                                            }
                                        })
                            }else {
                                //IF user is NOT owner of organization, then user will only LEAVE that organization
                                //At this point, we updated the user obj, so that is all that we need, we can send response back to client.
                                resultObj.message = "User has left the organization.";
                                res.json(resultObj);

                            }

                            }
                        });
                            



  

                    
                }
            });


});




module.exports = app;