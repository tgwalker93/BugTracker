const router = require("express").Router();
const userRoutes = require("./user");
const bugRoutes = require("./bug");
const organizationRoutes = require("./organization");

var express = require("express");
var app = express.Router();


// User routes
app.use("/user", userRoutes);

// Bug Routes
app.use("/bug", bugRoutes);

// Organization Routes
app.use("/organization", organizationRoutes);


module.exports = app;
