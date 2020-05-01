import axios from "axios";

export default {

    saveUser: function (userData) {
        console.log("I'm in the API file");
        console.log(userData);
        //return axios.post("/api/users/saveUser", userData)
        return axios.post("/api/user/saveUser", userData);
    },
    saveBug: function (bugData) {
        console.log("I'm in the API file");
        console.log(bugData);
        //return axios.post("/api/users/saveUser", userData)
        return axios.post("/api/bug/saveBug", bugData);
    },

};