// Require mongoose
var mongoose = require("mongoose");
// Create a schema class
var Schema = mongoose.Schema;

// Create the Note schema
var BugCommentSchema = new Schema({
    // Just a string
    title: {
        type: String
    },
    // Just a string
    text: {
        type: String
    }
});

// Remember, Mongoose will automatically save the ObjectIds of the comments

BugCommentSchema.index({ '$**': 'text' });

// Create the bugComment model with the bugComment
var BugComment = mongoose.model("BugComment", BugCommentSchema);

// Export the Note model
module.exports = BugComment;