import axios from "axios";

export default {

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
    getAllBugs: function() {
        //TODO - Set up organization ID query
        //Query db to get all bugs
        return axios.get("/api/bug/getAllBugs")
    }

};