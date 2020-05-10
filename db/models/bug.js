const mongoose = require('mongoose')
const Schema = mongoose.Schema
mongoose.promise = Promise

const BugSchema = new Schema({
        bugTitle: {
            type: String,
            required: true
        },
        bugCategory: {
            type: String,
            required: false
        },
        bugDescription: {
            type: String,
            required: false
        },
        userAssigned: {
            type: String,
            required: false
        },
        stepsToRecreate: {
            type: String,
            required: false
        },
        status: {
            type: String,
            required: false
        },
        subTasks: {
            type: Object,
            required: false
        },
        isCompleted: {
            type: Boolean,
            required: false
        },
        // This only saves one comment's ObjectId, ref refers to the Note model
        bugComments: [{
            type: Schema.Types.ObjectId,
            ref: "BugComment"
        }]
});

// Define schema methods
// BugSchema.methods = {
//     checkPassword: function (inputPassword) {
//         return bcrypt.compareSync(inputPassword, this.properties.password)
//     },
//     hashPassword: plainTextPassword => {
//         return bcrypt.hashSync(plainTextPassword, 10)
//     }
// }

// Define hooks for pre-saving
// BugSchema.pre('save', function (next) {
//     if (!this.properties.password) {
//         console.log('=======NO PASSWORD PROVIDED=======')
//         next()
//     } else {
//         this.properties.password = this.hashPassword(this.properties.password)
//         next()
//     }

// })


BugSchema.index({ '$**': 'text' });

// Create reference to Bug & export
const Bug = mongoose.model("Bug", BugSchema);
module.exports = Bug

