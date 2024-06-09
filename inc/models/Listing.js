const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    url: { type: String, required: true, unique: true },
    site: {type: String, required: true},
    status: {type: String, required: true},
    scrapedAt: { type: Date, default: Date.now }
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
