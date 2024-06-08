const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    url: { type: String, required: true, unique: true },
    scrapedAt: { type: Date, default: Date.now }
});

const Url = mongoose.model('Url', urlSchema);

module.exports = Url;
