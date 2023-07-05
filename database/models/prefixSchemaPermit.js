const mongoose = require('mongoose');

const prefixSchemaPermit = new mongoose.Schema({
    serverID: { type: String },
    serverName: { type: String },
    prefix: { type: String },
    owner: { type: String },
    members: { type: String },
    updates: { type: String },
    scores: { type: Array }
})

const model = mongoose.model('prefixModels', prefixSchemaPermit);

module.exports = model;