const mongoose = require('mongoose')
const Schema = mongoose.Schema
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

// Define schema methods
// UserSchema.methods = {
//     checkPassword: function (inputPassword) {
//         return bcrypt.compareSync(inputPassword, this.properties.password)
//     },
//     hashPassword: plainTextPassword => {
//         return bcrypt.hashSync(plainTextPassword, 10)
//     }
// }

// Define hooks for pre-saving
// UserSchema.pre('save', function (next) {
//     if (!this.properties.password) {
//         console.log('=======NO PASSWORD PROVIDED=======')
//         next()
//     } else {
//         this.properties.password = this.hashPassword(this.properties.password)
//         next()
//     }

// })


UserSchema.index({ '$**': 'text' });

// Create reference to User & export
const User = mongoose.model("User", UserSchema);
module.exports = User