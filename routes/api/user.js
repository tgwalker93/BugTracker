var path = require('path');
var request = require("request");
var express = require("express");
var passport = require('../../passport');
var app = express.Router();
//models 
var User = require("../../db/models/user.js");



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


//login new user

// app.post('/login', (req, res) => {
//     console.log('HELLO??????????????????');
    
// })


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
                res.json(err);
            }
            else if(user === false){
                req.body.loggedInSuccess = false;
                res.json(req.body);
            }
            else {
                //Since we found the user in the database, we have a successful login. But we don't want to send all the data back to the client.
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





// app.post('/login',
//     passport.authenticate('local', { failureRedirect: '/' }),
//     function (req, res) {
//         console.log("i'm in the LOGIN POST!!!!!!!!!!!!!!!!!!!");
//         console.log(req.body);
//         res.redirect('/');
//     });




// app.post('/login',

//     function (req, res) {
//         console.log("I'm in PASSPORT AUTHENTICATE, BELOW IS REQ AND THEN RES");
//         console.log(req.body);
//         //console.log(res);
//         passport.authenticate('local', {
//             successRedirect: '/',
//             failureRedirect: '/'
//         })
//         // If this function gets called, authentication was successful.
//         // `req.user` contains the authenticated user.
//         res.redirect('/login');
//     });


// app.post('/login',
//     passport.authenticate('local', {
//         successRedirect: '/',
//         failureRedirect: '/'
//     }),
//     function (req, res) {
//         console.log("I'm in PASSPORT AUTHENTICATE, BELOW IS REQ AND THEN RES");
//         console.log(req);
//         console.log(res);
//         // If this function gets called, authentication was successful.
//         // `req.user` contains the authenticated user.
//         res.redirect('/login');
//     });





// app.post(
//     '/login',
//     function (req, res, next) {
//         console.log("/user/login called")
//         console.log(req.body)
//         console.log(passport);
//         console.log('================')
//         next()
//     },
//     passport.authenticate('local', {successRedirect: "/profile", failureRedirect: "/profile"}),
//     (req, res) => {
//         console.log('POST to /login')
//         const user = JSON.parse(JSON.stringify(req.user)) // hack
//         const cleanUser = Object.assign({}, user)
//         if (cleanUser.properties) {
//             console.log(`Deleting ${cleanUser.properties.password}`)
//             delete cleanUser.properties.password
//         }
//         console.log(cleanUser);
//         res.json({ user: cleanUser })
//     },

//     // funtion(err, user, info) {
//     //     if(err) return next(err);}
//     //     if (!user) {return res.redirect("/"); }
//     //     req.LogIn(user, function(err) {
//     //         if (err) {return next (err); }
//     //         return res.redirect("/profile" + 
//     //     }
//     // }

// )

// app.get('/login', function (req, res, next) {
//     passport.authenticate('local', function (err, user, info) {
//         if (err) { return next(err); }
//         if (!user) { return res.redirect('/'); }
//         req.logIn(user, function (err) {
//             if (err) { return next(err); }
//             return res.redirect("/profile");
//         });
//     })(req, res, next);
// });


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
            req.body.error = true;
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


            /*//TODO ----- -----------
            
                Password is not encyrpting when trying to save. Please refer to the prehook "save" method which gets called in the user DB Model
            //---------------------------------------*/

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



//Save a newly registered user in the database.
app.post("/saveUser", function (req, res) {
    console.log("I'm in save user post")
    console.log(req.body);
    var resultObj = {
                email: req.body.email,
                password: req.body.password,
                username: "EMPTY",
                firstName: req.body.firstName,
                lastName: req.body.lastName
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