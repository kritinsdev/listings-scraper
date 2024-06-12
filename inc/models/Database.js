const mongoose = require('mongoose');
const ListingModel = require('../models/Listing');

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

    async saveListing(object) {
        try {
            const result = await ListingModel.updateOne(
                { url: object.url },
                {
                    $setOnInsert: {
                        url: object.url,
                        site: object.site,
                        status: object.status,
                    }
                },
                { upsert: true }
            );
    
            if (result.upsertedCount > 0) {
                console.log(`Inserted new URL: ${object.url}`);
            } else {
                console.log(`URL already exists: ${object.url}`);
            }
        } catch (error) {
            console.error(`Error saving URL: ${object.url}`, error);
        }
    }
    async fetchExistingUrls(site) {
        try {
            const urls = await ListingModel.find({ site }, 'url').lean();
            return urls.map(urlObj => urlObj.url);
        } catch (error) {
            console.error('Error fetching existing URLs:', error);
            return [];
        }
    }
}

module.exports = Database;
