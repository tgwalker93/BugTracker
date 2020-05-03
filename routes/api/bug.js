var path = require('path');
var request = require("request");
var express = require("express");
var app = express.Router();

//Database Models 
var Bug = require("../../db/models/bug.js");


//TODO MOVE THE DATA ACCESS METHODS TO A CONTROLLER!!!

//Getting bugs from the Database!
app.get("/getAllBugs", function (req, res) {

    Bug.find()
    .then(function(doc, error){
        // Log any errors
        if (error) {
            console.log("getUserData back-end failed!")
            console.log(error);
        }
        // Or send the doc to the browser as a json object
        else {
            console.log("getUserData back-end was successful!");
            res.json(doc);
        }
    })

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
        bugDescription: req.body.bugDescription };

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
            bugDescription: req.body.bugDescription

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
            resultObj.doc = doc;
            res.json(resultObj)
            // res.json(doc);
        }
    });

});

module.exports = app;