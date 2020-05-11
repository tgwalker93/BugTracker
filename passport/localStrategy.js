var path = require('path');
const User = require('../db/models/user.js')
const LocalStrategy = require('passport-local').Strategy

const strategy = new LocalStrategy(
    {
        usernameField: 'username' // not necessary, DEFAULT
    },
    function (username, password, done) {
        User.findOne({ 'email': username }, (err, userMatch) => {
            if (err) {
                return done(err);
            }
            if (!userMatch) {
                console.log("Incorrect username");
                console.log(userMatch);
                return done(null, false, { message: 'Incorrect username' });
            }
            if (!userMatch.checkPassword(password)) {
                return done(null, false, { message: 'Incorrect password' })
            }
            // if(userMatch.password !== password){
            //     console.log("incorrect password");
            //     console.log(userMatch);
            //     return done(null, false, { message: 'Incorrect password' });
            // }
            return done(null, userMatch)
        })
    }
)

module.exports = strategy
