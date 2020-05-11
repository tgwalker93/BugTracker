var path = require('path');
var request = require("request");
var express = require("express");
var app = express.Router();

//Database Models 
var Organization = require("../../db/models/organization.js");
var User = require("../../db/models/user.js");

//SAVE A Organization
app.post("/saveOrganization", function (req, res) {
    // Create a new Organization and pass the req.body to the entry
    let result = {
        name: req.body.organizationName,
        organizationID: req.body.organizationID,
        userWhoCreatedOrgMongoID: req.body.mongoID,
        users: [req.body.userFirstName + " " + req.body.userLastName]
    }

    var newOrganization = new Organization(result);

    let filter = { organizationID: req.body.organizationID };

    Organization
        .findOne(filter, function (error, doc) {
            // Log any errors -- 
            if (error) {
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
                        res.json(error);
                    }
                    // Otherwise
                    else {
                        // Use the User id to find and update its' organization
                        User.findOneAndUpdate({ "_id": req.body.mongoID }, { $push: { "organizations": doc._id } },
                            { safe: true, upsert: true })
                            // Execute the above query
                            .exec(function (err, doc) {
                                // Log any errors
                                if (err) {
                                    console.log(err);
                                    res.json(err);
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
                let responseObj = {
                    error: "Organization ID is taken already."
                }
                res.json(responseObj);
            }
        });

});

//UPDATING AN ORGANIZATION
app.post("/updateOrganization", function(req, res) {

    let filter = { _id: req.body.organizationMongoID };
    let options = {
        safe: true,
        upsert: false
    }

    let update = {
        name: req.body.organizationName,
        organizationID: req.body.organizationID
    };

    Organization
        .findOneAndUpdate(filter, update, options)
        .then(function (doc, error) {
            // Log any errors
            if (error) {
                console.log(error);
                res.json(error);
            }
            // Or send the doc to the browser as a json object
            else {
                res.json(doc);
            }
        })
        .catch(err => res.status(422).json(err));
});

//Get all organizations of a user object
app.get("/getAllOrganizationsOfUser/:mongoID", function(req, res) { 
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    User.findOne({ "_id": req.params.mongoID })
        // ..and populate all of the bug comments associated with it
        .populate("organizations")
        // now, execute our query
        .exec(function (error, doc) {
            // Log any errors
            if (error) {
                console.log(error);
                res.json(error);
            }
            // Otherwise, send the doc to the browser as a json object
            else {
                res.json(doc);
            }
        });
});


//attach user to organization
app.post("/attachUserToOrganization", function (req, res) {
    // Create a new Organization and pass the req.body to the entry
    let resultObj = {
        organizationID: req.body.organizationID,
        userMongoID: req.body.mongoID
    }

    let filter = { organizationID: req.body.organizationID };

    Organization
        .findOne(filter, function (error, organizationDoc) {
            // Log any errors -- 
            if (error) {
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

                var userIsAlreadyInOrganization = false;
                //Before we update user or organization, we want to make sure user is not already in organzation
                for(var i = 0; i<organizationDoc.users.length; i++){
                    if(organizationDoc.users[i] === req.body.userFirstName + " " + req.body.userLastName){
                        userIsAlreadyInOrganization = true;
                    }
                }
                if(userIsAlreadyInOrganization){
                    //Otherwise, we will officially send error messsage.
                    resultObj.error = "You have already joined that organization.";
                    res.json(resultObj);
                } else {
                    console.log("BEFORE USER UPDATE!!");
                    // Use the User id to find and update its' organization
                    User.findOneAndUpdate({ "_id": req.body.mongoID }, { $push: { "organizations": organizationDoc._id } },
                        { safe: true, upsert: true })
                        // Execute the above query
                        .exec(function (err, userDoc) {
                            // Log any errors
                            if (err) {
                                console.log(err);
                                res.json(err);
                            }
                            else {
                                // Or send the document to the browser

                                //Now that we saved the user, we need to push his name to the Organization user list
                                // Use the User id to find and update its' organization
                                resultObj.successMessage = "You've successfully joined an organization.";
                                resultObj.newUserObj = userDoc;
                                resultObj.organizations = userDoc.organizations;
                                organizationDoc.users.push(userDoc.firstName + " " + userDoc.lastName);
                                //And then save Organization
                                organizationDoc.save(function (err, afterOrganizationIsSaved) {
                                    // Log any errors
                                    if (err) {
                                        console.log(err);
                                        resultObj.error = "Something went wrong when trying to save the user";
                                        res.json(resultObj);
                                    }

                                    else {
                                        resultObj.successMessage = "You've successfully joined an organization.";
                                        res.json(resultObj);

                                    }
                                });

                            }
                        });

  
                }
            }
        });

});


//Delete an Organization
app.post("/deleteOrganization", function (req, res) {
    // Create a new Organization and pass the req.body to the entry
    let resultObj = {
        organizationMongoID: req.body.organizationMongoID,
        userMongoID: req.body.userMongoID,
        organization: req.body.organizationData,
        organizationAdminMongoID: req.body.organizationAdminMongoID,
        isUserOrganizationOwner: req.body.isUserOrganizationOwner
    }

        var filter = { _id: resultObj.userMongoID}

        User.findOne({ "_id": resultObj.userMongoID })
            // ..and populate all of the organizations associated with it
            .populate("organizations")
            // now, execute our query
            .exec(function (error, userDoc) {
                // Log any errors
                if (error) {
                    console.log(error);
                    res.json(error);
                }
                // Otherwise, we found the user!
                else {

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
                                                console.log(error);
                                                resultObj.error = true;
                                                resultObj.errorObj = error;
                                                res.json(error);
                                            }
                                            // Or send the doc to the browser as a json object
                                            else {
                                                //Deleting the bug was a success, now we need to make sure that remove the bug from the Organization doc in DB
                                                //TODO
                                                resultObj.deletedOrganizationDoc = doc;
                                                resultObj.message = "The organization has been deleted.";
                                                res.json(resultObj);

                                            }
                                        })
                            }else {
                                //IF user is NOT owner of organization, then user will only LEAVE that organization
                                //At this point, we need to update the organization users list
                                resultObj.message = "User has left the organization.";
                                    var filter = { _id: resultObj.organizationMongoID };
                                    Organization
                                        .findOneAndUpdate(filter, { $pullAll: { users: [req.body.userFirstName + " " + req.body.userLastName] } }, function (error, doc) {
                                            // Log any errors
                                            if (error) {
                                                console.log(error);
                                                resultObj.error = true;
                                                resultObj.errorObj = error;
                                                res.json(error);
                                            }
                                            // Or send the doc to the browser as a json object
                                            else {
                                                //Updating the organization was a success,
                                                resultObj.deletedOrganizationDoc = doc;
                                                resultObj.message = "You have successfully left the organization.";
                                                res.json(resultObj);

                                            }
                                        })

                            }

                            }
                        });
                            



  

                    
                }
            });


});




module.exports = app;