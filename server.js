const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes");
const session = require('express-session');
const mongoose = require("mongoose");
const MongoStore = require('connect-mongo')(session);
const dbConnection = require('./db'); // loads our connection to the mongo database
const passport = require('./passport');


const app = express();
const PORT = process.env.PORT || 3001;

// Configure body parser for AJAX requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ===== Passport for authentication ====
app.use(passport.initialize())
app.use(passport.session()) // will call the deserializeUser

// Serve up static assets
app.use(express.static("client/build"));

// Add routes, both API and view
app.use(routes);





// Start the API server
app.listen(PORT, function() {
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
});