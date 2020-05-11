// Require mongoose
var mongoose = require("mongoose");
// Create a schema class
var Schema = mongoose.Schema;

// Create the Note schema
var BugCommentSchema = new Schema({
    title: {
        type: String
    },
    text: {
        type: String
    },
    userWhoMadeComment: {
        type: String
    },
    //date that user made the comment
    timestamp: {
        type: String,
        default: Date.now().toString()
    }
});

// Remember, Mongoose will automatically save the ObjectIds of the comments

BugCommentSchema.index({ '$**': 'text' });

// Create the bugComment model with the bugComment
var BugComment = mongoose.model("BugComment", BugCommentSchema);

// Export the Note model
module.exports = BugComment;