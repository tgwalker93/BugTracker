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
    console.log('=====get user!!======')
    console.log(req.user)
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
                console.log("COULD NOT FIND USER WITH THAT EMAIL!")
                console.log(error);
                let responseObj = {
                    error: "Could not find a user with that email address. Please try again."
                }
                res.json(responseObj);
            }
            // Or send the doc to the browser as a json object
            else {
                console.log("FOUND USER WITH THAT EMAIL");      

                //Generate a random string to save as the password 
                var newPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

                //Now that we found our user (the doc variable, we want to save a newly generated password before we send email out)
                doc.password = newPassword;

                console.log("DOC BEFORE SAVING");
                console.log(doc);
                console.log("Here is the password: " + doc.password);
                
                //Update the user object in the db, effectively updating just the password.
                doc.save(function (error, doc) {

                    // Log any errors
                    if (error) {
                        responseObj.errorObj=error;
                        responseObj.error = "Something went wrong with saving the user that we found. Please try again.";

                    }
                    // Or send the doc to the browser as a json object
                    else {
                        console.log("updateUser node route back-end was successful, below is doc!");
                        console.log(doc);

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
                            error: "Something went wrong with the attempt to send email."
                        }
                        res.json(responseObj);
                    })





                //res.json(doc);
            }
        })
        .catch(err => res.status(422).json(err));



})

//Loggin in for the user (handled on app.js in the front end)
app.post("/login",
    function (req, res, next) {
        console.log("IM IN LOGIN POST user /login")
        passport.authenticate("local", {
            successRedirect: '/profile',
            failureRedirect: '/'
        }, function (err, user, info) {

            // handle succes or failure
            console.log("I SUCCESSFULLY CALLED post/Login from user route in backend. below is user");
            console.log(user);
            console.log("req.body");
            console.log(req.body);

            if(err){
                req.body.error = "Something went wrong with logging in."
                console.log(req.body);
                res.json(req.body);
            }
            else if(user === false){
                req.body.loggedInSuccess = false;
                req.body.error = "Could not find a user in our system with your email and password. Please try again."
                console.log(req.body);
                res.json(req.body);
            }
            else {


                console.log("below is req");
                console.log(req.body);

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
        console.log("I SUCCESSFULLY CALLED post/Login from user route in backend. below is user");
        console.log(user);
        console.log("req.body");
        console.log(req.body);

        if (err) {
            //Something went wrong in this request.
            console.log("Something went wrong in updateUser node route, below is req.body");
            console.log(req.body);
            res.json(err);
        }
        else if (user === false) {
            //User has not been found!! Let client know that no user found in DB
            console.log("user has not been found from updateUser node route, below is req.body");
            console.log(req.body);
            req.body.error = "The password you entered was incorrect. Please try again.";
            req.body.loggedInSuccess = false;
            res.json(req.body);
        }
        else {
            //Since we found the user in the database, we have a successful login. But we don't want to send all the data back to the client.
            console.log("user has been found from updateUser node ruote, below is req.body");
            console.log(req.body)
            let filter = { _id: req.body.mongoID };
            let options = {
                safe: true,
                upsert: false
            }

            let update = {
                password: req.body.password
            };

            console.log(req.body.mongoID);


            console.log("now that password was a match, please see req.body password below");
            console.log(req.body);
            user.password = req.body.newPassword;
            user.save(function (error, doc) {

                    // Log any errors
                    if (error) {
                        console.log("getUserData back-end failed!")
                        console.log(error);
                        res.json(error);
                    }
                    // Or send the doc to the browser as a json object
                    else {
                        console.log("updateUser node route back-end was successful, below is doc!");
                        console.log(doc);
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
    console.log("I'm in save user post")
    console.log(req.body);
    var resultObj = {
                email: req.body.email,
                password: req.body.password,
                firstName: req.body.firstName,
                lastName: req.body.lastName
    };
    console.log(resultObj);

    var entry = new User(resultObj);

    console.log("here is user");
    console.log(entry);

    //We want to search our database to see if this email is already taken.
    var filter = { email: req.body.email}
    User
        .findOne(filter)
        .then(function (doc, error) {
            // Log any errors
            if (error) {
                console.log("getUserData back-end failed!")
                console.log(error);
                resultObj.error = "Something went wrong with finding the User.";
                resultObj.errorObj = error;
                res.json(resultObj);
            }
            else if(doc === null){
                //If no user is found, then we can proceed with saving the user
                console.log("NO USER HAS BEEN FOUND");
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
            }
            else {
                console.log("User has been found!!!");
                resultObj.error = "A user with that email address already exists."
                res.json(resultObj);
            }
        })
        .catch(err => res.status(422).json(err));



    });

module.exports = app;