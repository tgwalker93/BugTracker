var path = require('path');
var request = require("request");
var express = require("express");
var app = express.Router();
//models 
var User = require("../../db/models/bug.js");

//Save a bug to the Database! 
app.post("/saveBug", function (req, res) {
    console.log("I'm in save bug post")
    console.log(req.body);

    // id: {
    //     type: Number,
    //         required: true
    // },
    // bugName: {
    //     type: String,
    //         required: true
    // },
    // bugCategory: {
    //     type: String,
    //         required: false
    // },
    // bugDescription: {
    //     type: String,
    //         required: false
    // },
    // userAssigned: {
    //     type: String,
    //         required: false
    // },
    // subTasks: {
    //     type: Object,
    //         required: false
    // }
    var resultObj = {
        properties:
        {
            bugTitle: req.body.bugTitle,
            bugDescription: req.body.bugDescription
        }

    };
    console.log(resultObj);

    var entry = new User(resultObj);

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
            console.log(doc);
            resultObj.doc = doc;
            res.json(resultObj)
            // res.json(doc);
        }
    });

});

module.exports = app;