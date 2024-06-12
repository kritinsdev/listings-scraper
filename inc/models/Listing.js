const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    model: { type: String, required: false},
    modelId: { type: Number, required: false},
    price: {type: Number, required: false},
    memory: {type: Number, required: false},
    url: { type: String, required: true, unique: true },
    site: {type: String, required: true},
    status: {type: String, required: true},
    scrapedAt: { type: Date, default: Date.now }
});

const Listing = mongoose.model('Listing', schema);

module.exports = Listing;
