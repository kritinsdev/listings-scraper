const mongoose = require('mongoose');
const Listing = require('../models/Listing');

class Database {
    constructor(uri) {
        this.uri = uri;
    }

    async connect() {
        try {
            await mongoose.connect(this.uri);
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
        }
    }

    async close() {
        try {
            await mongoose.connection.close();
            console.log('Closed MongoDB connection');
        } catch (error) {
            console.error('Error closing MongoDB connection:', error);
        }
    }

    async saveListing(listing) {
        try {
            const result = await Listing.updateOne(
                { url: listing.url },
                {
                    $setOnInsert: {
                        model: listing.model,
                        modelId: listing.modelId,
                        price: listing.price,
                        memory: listing.memory,
                        url: listing.url,
                        site: listing.site,
                        status: listing.status,
                    }
                },
                { upsert: true }
            );
    
            if (result.upsertedCount > 0) {
                console.log(`Inserted new URL: ${listing.url}`);
            } else {
                console.log(`URL already exists: ${listing.url}`);
            }
        } catch (error) {
            console.error(`Error saving URL: ${listing.url}`, error);
        }
    }
    async fetchExistingUrls(site) {
        try {
            const urls = await Listing.find({ site }, 'url').lean();
            return urls.map(urlObj => urlObj.url);
        } catch (error) {
            console.error('Error fetching existing URLs:', error);
            return [];
        }
    }
}

module.exports = Database;
