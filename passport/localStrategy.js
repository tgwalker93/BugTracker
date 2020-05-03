var path = require('path');
const User = require('../db/models/user.js')
const LocalStrategy = require('passport-local').Strategy

const strategy = new LocalStrategy(
    {
        usernameField: 'username' // not necessary, DEFAULT
    },
    function (username, password, done) {
        console.log("IM IN localStrategy!!!!!!!!!!!!!!");
        console.log("here is username: " + username);
        console.log(password);
        User.findOne({ 'email': username }, (err, userMatch) => {
            if (err) {
                return done(err);
            }
            if (!userMatch) {
                return done(null, false, { message: 'Incorrect username' });
            }
            // if (!userMatch.checkPassword(password)) {
            //     return done(null, false, { message: 'Incorrect password' })
            // }
            if(userMatch.password !== password){
                return done(null, false, { message: 'Incorrect password' });
            }

            console.log("Password is a MATCH!!!!!");
            return done(null, userMatch)
        })
    }
)

module.exports = strategy
