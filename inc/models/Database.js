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
                        series: listing.series,
                        price: listing.price,
                        memory: listing.memory,
                        url: listing.url,
                        site: listing.site,
                        status: listing.status,
                        createdAt: listing.createdAt
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

    async fetchListings(site, modelId, sortPrice) {
        try {
            const query = {};
    
            if (site) {
                query.site = site;
            }
    
            if (modelId) {
                query.modelId = modelId;
            }
    
            let sort = { scrapedAt: -1 };
            if (sortPrice) {
                sort = { price: sortPrice === 'asc' ? 1 : -1 };
            }
    
            const listings = await Listing.find(query).sort(sort).lean();
            return listings;
        } catch (error) {
            console.error('Error fetching listings:', error);
            return [];
        }
    }


    async fetchListingsByModelId(modelId) {
        try {
            const query = modelId ? { modelId } : {};
            const listings = await Listing.find(query).lean();
            return listings;
        } catch (error) {
            console.error('Error fetching listings by modelId:', error);
            return [];
        }
    }
}

module.exports = Database;
