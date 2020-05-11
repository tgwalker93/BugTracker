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
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        // This only saves one comment's ObjectId, ref refers to the Organization model
        organizations: [{
            type: Schema.Types.ObjectId,
            ref: "Organization"
        }]
});

//Define schema methods
UserSchema.methods = {
    checkPassword: function (inputPassword) {
        if(!this.password){
            return false;
        }
        return bcrypt.compareSync(inputPassword, this.password);
    },
    hashPassword: plainTextPassword => {
        return bcrypt.hashSync(plainTextPassword, 10)
    }
}

//Define hooks for pre-saving
UserSchema.pre('save', function (next) {
    if (!this.password) {
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