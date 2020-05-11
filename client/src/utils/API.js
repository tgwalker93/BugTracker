import axios from "axios";

export default {

    // USER CALLS TO DB -----
    user: function () {
        return axios.get("/api/user");
    },
    sendForgotPasswordEmail(userObj) {
        return axios.post("/api/user/sendForgotPasswordEmail", userObj);
    },
    updateUserInDB(userObj){
        return axios.post("/api/user/updateUser", userObj);
    },
    login: function (userData) {
        return axios.post("/api/user/login", userData)
    },
    saveUser: function (userData) {
        return axios.post("/api/user/saveUser", userData);
    },

    //BUG CALLS TO DB --------
    saveBug: function (bugData) {
        return axios.post("/api/bug/saveBug", bugData);
    },
    updateBug: function (bugData) {
        return axios.post("/api/bug/updateBug", bugData);
    },
    deleteBug: function (bugData) {
        return axios.post("/api/bug/deleteBug", bugData);
    },
    getAllBugs: function (organizationMongoID) {
        return axios.get("/api/bug/getAllBugs/" + organizationMongoID);
    },
    

    // BUG COMMENT CALLS  TO DB -------
    deleteBugComment: function (bugCommentData) {
        return axios.post("/api/bug/deleteBugComment/" + bugCommentData._id);
    },
    saveBugComment: function(bugAndCommentData) {
        return axios.post("/api/bug/saveBugComment", bugAndCommentData);
    },
    getBugComments: function(bugData) {
        return axios.get("/api/bug/getBugComments/" + bugData.mongoID);
    },

    // ORGANIZATION CALLS TO DB ------
    saveOrganizationInDB: function(userData) {
        return axios.post("/api/organization/saveOrganization", userData);
    },
    getOrganizationsOfUserInDB: function(userData){
        return axios.get("/api/organization/getAllOrganizationsOfUser/" + userData.mongoID);
    },
    attachUserToOrganizationInDB: function (userData) {
        return axios.post("/api/organization/attachUserToOrganization", userData);
    },
    deleteOrganizationInDB: function(organizationData){
        return axios.post("/api/organization/deleteOrganization", organizationData);
    },
    updateOrganizationInDB: function(userData){
        return axios.post("/api/organization/updateOrganization", userData)
    }

};