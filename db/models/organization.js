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
        required: false
    }
});




OrganizationSchema.index({ '$**': 'text' });

// Create reference to Bug & export
const Organization = mongoose.model("Organization", OrganizationSchema);
module.exports = Organization
