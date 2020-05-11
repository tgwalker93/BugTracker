var path = require('path');
var request = require("request");
var axios = require("axios");
var express = require("express");
var sgMail = require('@sendgrid/mail');
var passport = require('../../passport');
var dotenv = require('dotenv');
var app = express.Router();

//loading .env file
dotenv.config();

//models 
var User = require("../../db/models/user.js");

dotenv.config();

// this route is just used to get the user basic info
app.get('/user', (req, res) => {
    if (req.user) {
        return res.json({ user: req.user })
    } else {
        return res.json({ user: null })
    }
})



//Sending forgot password email using the sendGridAPI
app.post('/sendForgotPasswordEmail', (req, res, next) => {

    var responseObj = {

    }
    let filter = { email: req.body.email };

    User
        .findOne(filter, function (error, doc) {
            // Log any errors
            if (error || doc===null) {
                let responseObj = {
                    error: "Could not find a user with that email address. Please try again."
                }
                res.json(responseObj);
            }
            // Or send the doc to the browser as a json object
            else {   

                //Generate a random string to save as the password 
                var newPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

                //Now that we found our user (the doc variable, we want to save a newly generated password before we send email out)
                doc.password = newPassword;
                
                //Update the user object in the db, effectively updating just the password.
                doc.save(function (doc, error) {

                    // Log any errors
                    if (error) {
                        console.log(error);
                        responseObj.errorObj=error;
                        responseObj.error = "Something went wrong with saving the user that we found. Please try again.";

                    }
                })

                //Now that we saved the new password, we will use the sendgridAPI to send the email to the user

                //First we draft the email and API config stuff


                //Checking to see if we are not on the heroku server
                var apiKey = "NONE";
                if(process.env.USERDOMAIN !== "TYLER") {
                    apikey = process.env.SENDGRID_API_KEY;
                    
                }
                let sendGridAPIConfig = {
                    headers: {
                        "Authorization": "Bearer " + apikey,
                        "Content-Type": "application/json"
                    }
                }
                //Basic query for sending out a single email
                var query = "https://api.sendgrid.com/v3/mail/send";
                
                //Below is the object the sendGrid expects when they draft an email
                var emailObj = {
                    "from": {
                        "email": "youmustloveslayingbugs@gmail.com",
                        "name": "Tyler the Bug Slayer"
                    },
                    "personalizations": [
                        {
                            "to": [
                                {
                                    "email": req.body.email,
                                    "name": "Registered User"
                                }
                            ],
                            "dynamic_template_data": {
                                "password": newPassword                             
                            }
                        }
                    ],
                    "template_id": "d-cb6496ac0da343c2b9960b3037aaa9c3" 
                }

                //Now we use axios to POST to the sendgrid API
                axios
                    .post(query, emailObj, sendGridAPIConfig)
                    .then(APIres => {
                        let responseObj = 
                        {
                            message: "We found a user with that email address. An email has been sent!",
                            APIresponseObj: APIres
                        }
                        res.json(responseObj);
                    })
                    .catch(error => {
                        console.error(error)
                        var responseObj = {
                            errorObj: error,
                            error: "We found a user with that email address. An email has been sent!"
                        }
                        res.json(responseObj);
                    })

            }
        })
        .catch(err => res.status(422).json(err));



})

//Loggin in for the user (handled on app.js in the front end)
app.post("/login",
    function (req, res, next) {
        passport.authenticate("local", {
            successRedirect: '/profile',
            failureRedirect: '/'
        }, function (err, user, info) {

            //error went wrong with logging in
            if(err){
                req.body.error = "Something went wrong with logging in."
                res.json(req.body);
            }
            //Cant find user
            else if(user === false){
                req.body.loggedInSuccess = false;
                req.body.error = "Could not find a user in our system with your email and password. Please try again."
                res.json(req.body);
            }
            else {
            //User found
                userObjToSendBackToClient =
                {
                    username: req.body.username,
                    mongoID: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    password: user.password,
                    loggedInSuccess: true
                }
                res.json(userObjToSendBackToClient);
            }

        })(req, res, next);
    })



//Updating a user
app.post("/updateUser", function (req, res, next) {

    passport.authenticate("local", {
        successRedirect: '/profile',
        failureRedirect: '/'
    }, function (err, user, info) {

        // handle succes or failure
        if (err) {
            //Something went wrong in this request.
            res.json(err);
        }
        else if (user === false) {
            //User has not been found!! Let client know that no user found in DB
            req.body.error = "The password you entered was incorrect. Please try again.";
            req.body.loggedInSuccess = false;
            res.json(req.body);
        }
        else {
            //Since we found the user in the database, we have a successful login. But we don't want to send all the data back to the client.
            let filter = { _id: req.body.mongoID };
            let options = {
                safe: true,
                upsert: false
            }

            let update = {
                password: req.body.password
            };

            user.password = req.body.newPassword;
            user.save(function (error, doc) {

                    // Log any errors
                    if (error) {
                        console.log(error);
                        res.json(error);
                    }
                    // Otherwise, updating user in DB was successful
                    else {
                    userObjToSendBackToClient =
                                {
                                    message: "Success",
                                    username: req.body.username,
                                    mongoID: user._id,
                                    firstName: user.firstName,
                                    lastName: user.lastName,
                                    password: user.password,
                                    loggedInSuccess: true
                                }
                        res.json(userObjToSendBackToClient);
                    }
                })
   
        }

    })(req, res, next);

});



//Save a newly registered user in the database. When user selected "Create Account"
app.post("/saveUser", function (req, res) {
    var resultObj = {
                email: req.body.email,
                password: req.body.password,
                firstName: req.body.firstName,
                lastName: req.body.lastName
    };

    var entry = new User(resultObj);

    //We want to search our database to see if this email is already taken.
    var filter = { email: req.body.email}
    User
        .findOne(filter)
        .then(function (doc, error) {
            // Log any errors
            if (error) {
                console.log(error);
                resultObj.error = "Something went wrong with finding the User.";
                resultObj.errorObj = error;
                res.json(resultObj);
            }
            else if(doc === null){
                //If no user is found, then we can proceed with saving the user
                entry.save(function (err, doc) {
                    // Log any errors
                    if (err) {
                        console.log(err);
                        resultObj.error = err;
                        res.json(err);
                    }
                    // Or send doc to client
                    else {
                        resultObj.doc = doc;
                        res.json(resultObj)
                    }
                });
            }
            else {
                //User already exists. Send message back to client.
                resultObj.error = "A user with that email address already exists."
                res.json(resultObj);
            }
        })
        .catch(err => res.status(422).json(err));



    });

module.exports = app;