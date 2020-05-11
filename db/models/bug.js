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


BugSchema.index({ '$**': 'text' });

// Create reference to Bug & export
const Bug = mongoose.model("Bug", BugSchema);
module.exports = Bug

