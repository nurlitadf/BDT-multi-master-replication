const mongoose = require('mongoose');

const forestSchema = mongoose.Schema({
    year: {
        type: Number,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    month: String,
    number: Number,
    date: Date,
}, {collection:'forestfireCollection'});

const Forest = module.exports = mongoose.model('forestfireCollection', forestSchema);
module.exports.get = function (callback, limit) {
    Forest.find(callback).limit(limit);
}