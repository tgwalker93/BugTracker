var path = require('path');
var request = require("request");
var express = require("express");
var app = express.Router();
//models 
var User = require("../../db/models/user.js");


//Save a newly registered user in the database.
app.post("/saveUser", function (req, res) {
    console.log("I'm in save user post")
    console.log(req.body);
    var resultObj = {
        properties:
            {
                email: req.body.email,
                password: req.body.password,
                username: "EMPTY",
                firstName: req.body.firstName,
                lastName: req.body.lastName
            }

    };
    console.log(resultObj);

    var entry = new User(resultObj);

    console.log("here is user");
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
            console.log(doc);
            resultObj.doc = doc;
            res.json(resultObj)
            // res.json(doc);
        }
    });

    });

module.exports = app;