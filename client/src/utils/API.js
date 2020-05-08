import axios from "axios";

export default {

    // USER CALLS  -----
    user: function () {
        console.log("i'm in API.js file, calling user");
        return axios.get("/api/user");
    },
    sendForgotPasswordEmail(userObj) {
        console.log("i'm in API.JS on the front end");
        return axios.post("/api/user/sendForgotPasswordEmail", userObj);
    },
    updateUserInDB(userObj){
        return axios.post("/api/user/updateUser", userObj);
    },
    login: function (userData) {
        console.log("LoginAPI")
        console.log(userData);
        // return axios.get("/api/user/login");
        return axios.post("/api/user/login", userData)
    },
    saveUser: function (userData) {
        console.log("I'm in the API file");
        console.log(userData);
        return axios.post("/api/user/saveUser", userData);
    },

    //BUG CALL --------
    saveBug: function (bugData) {
        console.log("I'm in the API file");
        console.log(bugData);
        return axios.post("/api/bug/saveBug", bugData);
    },
    updateBug: function (bugData) {
        console.log("I'm in the API file");
        console.log(bugData);
        return axios.post("/api/bug/updateBug", bugData);
    },
    deleteBug: function (bugData) {
        console.log("I'm in the API file");
        console.log(bugData);
        return axios.post("/api/bug/deleteBug", bugData);
    },
    getAllBugs: function() {
        //TODO - Set up organization ID query
        //Query db to get all bugs
        return axios.get("/api/bug/getAllBugs")
    },
    

    // BUG COMMENT CALLS -------
    deleteBugComment: function (bugCommentData) {
        console.log("I'm in deleteBugComment Api.js");
        console.log(bugCommentData)
        return axios.post("/api/bug/deleteBugComment/" + bugCommentData._id);
    },
    saveBugComment: function(bugAndCommentData) {
        return axios.post("/api/bug/saveBugComment", bugAndCommentData);
    },
    getBugComments: function(bugData) {
        console.log("I'm in getbugcomments front end API.JS");
        console.log(bugData.mongoID);
        return axios.get("/api/bug/getBugComments/" + bugData.mongoID);
    }

};