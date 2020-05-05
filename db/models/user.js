const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs')
mongoose.promise = Promise

const UserSchema = new Schema({
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        },
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        organizations: {
            type: Array,
            required: false,
        }
});

//Define schema methods
UserSchema.methods = {
    checkPassword: function (inputPassword) {
        console.log("i'm in User DB Modal and below is input password vs password in DB");
        console.log("inputpassword: " + inputPassword);
        console.log(this);
        if(!this.password){
            console.log("In User DB Model - Password of this object is null for some reason??");
            return false;
        }
        console.log(bcrypt.compareSync(inputPassword, this.password));
        return bcrypt.compareSync(inputPassword, this.password);
    },
    hashPassword: plainTextPassword => {
        return bcrypt.hashSync(plainTextPassword, 10)
    }
}

//Define hooks for pre-saving
UserSchema.pre('save', function (next) {
    if (!this.password) {
        console.log('=======NO PASSWORD PROVIDED=======')
        next()
    } else {
        this.password = this.hashPassword(this.password)
        next()
    }

})

//Define hooks for pre-updating
UserSchema.pre('findOneAndUpdate', function (next) {
    if (!this.password) {
        console.log('=======NO PASSWORD PROVIDED=======')
        next()
    } else {
        this.password = this.hashPassword(this.password)
        next()
    }

})



UserSchema.index({ '$**': 'text' });

// Create reference to User & export
const User = mongoose.model("User", UserSchema);
module.exports = User