import axios from "axios";

export default {
    user: function () {
        console.log("i'm in API.js file, calling user");
        return axios.get("/api/user");
    },
    sendEmail() {
        console.log("i'm in API.JS on the front end");
        return axios.get("/api/user/sendEmail");
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
    }

};