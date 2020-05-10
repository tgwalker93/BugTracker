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
            } 
            else {
                //IF USER IS FOUND, WE SEND ERROR BACK SAYING ORGANIZATION ID IS TAKEN
                console.log(error);
                let responseObj = {
                    error: true,
                    errorReason: "OrganizationID already exists."
                }
                res.json(responseObj);
            }
        });

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


    //before I handle this i'm just going to handle deleting first!!!
    resultObj.isUserOrganizationOwner = true;
    if (resultObj.isUserOrganizationOwner){
        //If user is owner of organization, then we will DELETE the organization entirely from DB.
        // Organization.findByIdAndRemove(resultObj.organizationMongoID, function (error, doc) {
        //     // Log any errors
        //     if (error) {
        //         console.log(error);
        //     }
        //     else {
        //         // Or send the document to the browser
        //         res.send(doc);
        //     }
        // });
        var filter = { _id: resultObj.userMongoID}

        //User.updateone(filter, { $pullAll: { uid: [req.params.deleteUid] } })
        User.findOne({ "_id": resultObj.userMongoID })
            // ..and populate all of the bug comments associated with it
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

                   
                    //userDoc.organizations.pull({_id: resultObj.organizationMongoID});

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
                                // Removing the organization from User Array was a success! Below is userDoc
                                console.log(userDoc)

                                //Now that I updated the user, I need to delete the ORGANIZATION
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
                                            res.json(resultObj);

                                        }
                                    })

                            }
                        });
                            



  

                    
                }
            });


    }else {
        //IF user is NOT owner of organization, then we will remove organization from User Doc in DB
    }



    // let filter = { organizationID: req.body.organizationID };

    // console.log("Here is the filter");
    // console.log(filter);

    // Organization
    //     .findOne(filter, function (error, doc) {
    //         // Log any errors -- 
    //         if (error) {
    //             console.log("ERROR FOUND WHEN TRYING TO SEARCH ORGANIZATION!")
    //             console.log(error);
    //             let responseObj = {
    //                 error: true,
    //                 errorReason: "Server error."
    //             }
    //             res.json(responseObj);
    //         }
    //         // IF Organization IS NOT FOUND, then we send error back to client, unable to join organizaiton
    //         //organizationID MUST BE UNIQUE! 
    //         else if (doc === null) {
    //             console.log(error);
    //             let responseObj = {
    //                 error: true,
    //                 errorReason: "Cannot find Organization with that Organization ID"
    //             }
    //             res.json(responseObj);
    //         }
    //         else {
    //             //If the ORGANIZATION ID is found, then we will update that Organization.
    //             //We will update the Organization mongoID in the User Model's "organizations" array
    //             // Use the User id to find and update its' organization
    //             User.findOneAndUpdate({ "_id": req.body.mongoID }, { $push: { "organizations": doc._id } },
    //                 { safe: true, upsert: true })
    //                 // Execute the above query
    //                 .exec(function (err, doc) {

    //                     console.log("Found organization and updated?");
    //                     console.log(doc);
    //                     // Log any errors
    //                     if (err) {
    //                         console.log(err);
    //                     }
    //                     else {
    //                         // Or send the document to the browser
    //                         res.send(doc);
    //                     }
    //                 });
    //         }
    //     });

});




module.exports = app;