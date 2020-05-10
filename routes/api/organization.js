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
                    error: true,
                    errorReason: "Server error."
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
                    error: true,
                    errorReason: "OrganizationID already exists."
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
    let result = {
        organizationID: req.body.organizationID,
        userMongoID: req.body.mongoID
    }

    console.log(result);

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
                    error: true,
                    errorReason: "Server error."
                }
                res.json(responseObj);
            }
            // IF Organization IS NOT FOUND, then we send error back to client, unable to join organizaiton
            //organizationID MUST BE UNIQUE! 
            else if (doc === null) {
                console.log(error);
                let responseObj = {
                    error: true,
                    errorReason: "Cannot find Organization with that Organization ID"
                }
                res.json(responseObj);
            }
            else {
                //If the ORGANIZATION ID is found, then we will update that Organization.
                //We will update the Organization mongoID in the User Model's "organizations" array
               // Use the User id to find and update its' organization
                User.findOneAndUpdate({ "_id": req.body.mongoID }, { $push: { "organizations": doc._id } },
                    { safe: true, upsert: true })
                    // Execute the above query
                    .exec(function (err, doc) {

                        console.log("Found organization and updated?");
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