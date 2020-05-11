var path = require('path');
var request = require("request");
var express = require("express");
var app = express.Router();

//Database Models 
var Bug = require("../../db/models/bug.js");
var BugComment = require("../../db/models/bugComment.js");
var Organization = require("../../db/models/organization.js");


//TODO MOVE THE DATA ACCESS METHODS TO A CONTROLLER!!!

//Getting bugs from the Database!
app.get("/getAllBugs/:organizationMongoID", function (req, res) {
    console.log("I'm in the getALL BUGS on the backend. Below is organization MONGO ID");
    console.log(req.params.organizationMongoID);
    resultObj = {
        
    }
    //Use the org id param to find the organization and its associated bugs
    Organization.findOne({ "_id": req.params.organizationMongoID })
        // ..and populate all of the bug comments associated with it
        .populate("bugs")
        // now, execute our query
        .exec(function (error, doc) {
            // Log any errors
            if (error) {
                //Error with gettings bugs from Organization, sending back error
                console.log(error);
                resultObj.error = true;
                resultObj.errorObj = error;
                res.json(resultObj);
            }
            // Otherwise, send the doc to the browser as a json object
            else {
                resultObj.organizationDoc = doc;
                res.json(resultObj);
            }
        });

})


//Getting delete a bug from the Database!
app.post("/deleteBug", function (req, res) {

    console.log("i'm in the DELETE BUG BACKEND API/ ROUTE");
    console.log(req.body);


    let update = {
        bugTitle: req.body.bugTitle,
        bugDescription: req.body.bugDescription,
        userAssigned: req.body.userAssigned,
        status: req.body.status
    };

    console.log("Constructing the Result obj to return to the client");
    var resultObj = {
        update: update   
    }

    Organization.findOneAndUpdate({ "_id": req.body.organizationMongoID },
        { $pullAll: { bugs: [req.body.bugMongoID] } },
        { safe: true })
        // Execute the above query
        .exec(function (err, orgMongoDoc) {
            // Log any errors
            if (err) {
                console.log(err);
                resultObj.error = true;
                resultObjt.errorObj = err;
                res.json(error);
            }
            else {
                //Now that I updated the Organization's bug array...
                            //now that we deleted all the bug comments, we will now delete the bug itself
                            //Find the bug and deleted
                            var filter = { _id: req.body.bugMongoID };                          
                     Bug.deleteOne(filter, function (error, bugDoc) {
                                // Log any errors
                                if (error) {
                                    console.log("Bug deleted back-end failed!")
                                    console.log(error);
                                    resultObj.error = true;
                                    resultObj.errorObj = error;
                                    res.json(resultObj);
                                }
                                // Or send the doc to the browser as a json object
                                else {
                                    console.log("Bug delete back-end was successful!");
                                    //Deleting the bug was a success, now we need to make sure that remove the bug from the Organization doc in DB
                                    //TODO
                                    console.log(bugDoc);

                                    resultObj.deletedBugDoc = bugDoc;
                                    resultObj.message = "The Bug has been deleted.";
                                    resultObj.error = false;
                                    //Now that the bug has been sucessfully deleted, we want to delete all the associated bug comments! 

                                    res.json(resultObj);

                                }
                            })            
                }
            });


})


//Updating a bug from the Database!
app.post("/updateBug", function (req, res) {

    console.log("i'm in the UPDATE BUG BACKEND");
    console.log(req.body);


    let filter = { _id: req.body.mongoID};
    let options = {
        safe: true, 
        upsert: true
    }

    let update = { bugTitle: req.body.bugTitle, 
        bugDescription: req.body.bugDescription,
    userAssigned: req.body.userAssigned,
    status: req.body.status,
    isCompleted: req.body.isCompleted };

    console.log(req.body.mongoID);

    Bug
        .findOneAndUpdate(filter, update, options)
        .then(function (doc, error) {
            // Log any errors
            if (error) {
                console.log("getUserData back-end failed!")
                console.log(error);
                res.json(error);
            }
            // Or send the doc to the browser as a json object
            else {
                console.log("getUserData back-end was successful!");
                console.log(doc);
                res.json(doc);
            }
        })
        .catch(err => res.status(422).json(err));
        
       
       
       

})

//Save a bug to the Database! 
app.post("/saveBug", function (req, res) {
    console.log("I'm in save bug post")
    console.log(req.body);


    var resultObj = {
            bugTitle: req.body.bugTitle,
            bugDescription: req.body.bugDescription,
            userAssigned: req.body.userAssigned,
            isCompleted: false,
            status: req.body.status 

    };
    console.log(resultObj);

    var entry = new Bug(resultObj);

    console.log("here is bug");
    console.log(entry);

    // Now, save that entry to the db
    entry.save(function (err, doc) {
        // Log any errors
        if (err) {
            console.log("OHH NO I HAVE AN ERORR");
            console.log(err);
        }
        // Or log the doc
        else {
            console.log("SAVING NEW BUG SUCCESS FROM BACKEND");
            console.log(doc);
            resultObj.bugDoc = doc;
            //Now that we saved the bugs, we need to find the Organization and add to it's array the new bug.
            // Use the organization id to find and update its' bugs
            Organization.findOneAndUpdate({ "_id": req.body.organizationMongoID }, { $push: { "bugs": doc._id } },
                { safe: true, upsert: false })
                // Execute the above query
                .exec(function (err, doc) {


                    // Log any errors
                    if (err) {
                        console.log(err);
                        resultObj.error = true;
                        resultObj.errorObj = err;
                        res.send(resultObj);
                    }
                    else {
                        // Updating Organization was success, added new Organization DOc, and send back to client
                        resultObj.organizationDoc = doc;
                         res.send(resultObj);
                    }
                });
            //res.json(resultObj)
            // res.json(doc);
        }
    });

});


//Bug Comments Routes BEGIN ---------------------------------------------------------------

//DELETE A Bug Comment
app.post("/deleteBugComment/:id", function (req, res) {

    console.log("I'm in deleteBugComment backend");
    console.log(req.params.id);
    BugComment.findByIdAndRemove(req.params.id, function (error, doc) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        else {
            // Or send the document to the browser
            res.send(doc);
        }
    });

});

//SAVE A Bug Comment
app.post("/saveBugComment", function (req, res) {

    console.log("I'm in the save bug comment backend");
    console.log(req.body);

     var currentDateTime = currentdate.getDate() + "/"
        + (currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":"
        + currentdate.getSeconds();
    // Create a new bug comment and pass the req.body to the entry
    let result = {
        title: req.body.text,
        text: req.body.text,
        timestamp: currentDateTime
    }

    console.log(result);
    var newBugComment = new BugComment(result);

    // And save the new bug comment the db
    newBugComment.save(function (error, doc) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Otherwise
        else {
            // Use the bug id to find and update its' comment
            Bug.findOneAndUpdate({ "_id": req.body.mongoID }, { $push: { "bugComments": doc._id } },
                { safe: true, upsert: true })
                // Execute the above query
                .exec(function (err, doc) {

                    console.log("Found bug and updated? Below is bug");
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

//SEARCH Bug Comments BY BUG ID
app.get("/getBugComments/:id", function (req, res) {

    console.log("i'm in the GET BUG COMMENTS BACK END");
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    bug = req.body._id;
    console.log(req.params.id);
    Bug.findOne({ "_id": req.params.id })
        // ..and populate all of the bug comments associated with it
        .populate("bugComments")
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

//Bug Comments END -----------------------------------------------------------

module.exports = app;