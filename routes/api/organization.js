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
        organizationID: req.body.organizationID
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
            // IF USER IS NOT FOUND, then we an save the new organization, since organizationID MUST BE UNIQUE! 
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
    console.log("i'm in the attachedUserToOrganization BACK END");

});



module.exports = app;