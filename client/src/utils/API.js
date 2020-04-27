import axios from "axios";

export default {

    saveUser: function (userData) {
        console.log("I'm in the API file");
        console.log(userData);
        //return axios.post("/api/users/saveUser", userData)
        return axios.post("/api/user/saveUser", userData)
    },

};