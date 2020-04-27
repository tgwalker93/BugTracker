const router = require("express").Router();
const userRoutes = require("./user");

var express = require("express");
var app = express.Router();


// User routes
app.use("/user", userRoutes);



module.exports = app;
