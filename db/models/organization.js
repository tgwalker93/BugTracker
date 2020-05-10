const mongoose = require('mongoose')
const Schema = mongoose.Schema
mongoose.promise = Promise

const OrganizationSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    organizationID: {
        type: String,
        required: true
    },
    //MongoID of user who created ID. Only owners can delete the organization
    userWhoCreatedOrgMongoID: {
        type: String,
        required: true   
    },
    // This only saves one comment's ObjectId, ref refers to the Note model
    bugs: [{
        type: Schema.Types.ObjectId,
        ref: "Bug"
    }]
});




OrganizationSchema.index({ '$**': 'text' });

// Create reference to Bug & export
const Organization = mongoose.model("Organization", OrganizationSchema);
module.exports = Organization
