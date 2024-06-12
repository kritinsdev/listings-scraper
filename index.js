const express = require('express');
const Database = require('./inc/models/Database');
const Scraper = require('./inc/Scraper');
const { sitesConfig, sites } = require('./siteConfig');

const app = express();
const port = process.env.PORT || 4000;

const db = new Database(process.env.MONGO_URI);

app.use(express.json());

(async () => {
    await db.connect();
})();

app.get('/', (req, res) => {
    res.send('[INDEX]');
});

app.get('/scrape23hashed', async (req, res) => {
    try {
        res.status(200).send('Scraping started');
        await startScrape();
    } catch (error) {
        console.error('Error during scraping:', error);
        res.status(500).send('An error occurred while scraping.');
    }
});

// app.get('/api/listings', async (req, res) => {
//     try {
//         const site = req.query.site;
//         const listings = await db.fetchListings(site);
//         res.json(listings);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

// app.get('/api/listings/model', async (req, res) => {
//     try {
//         const modelId = req.query.modelId; // Get modelId parameter from query string
//         const listings = await db.fetchListingsByModelId(modelId);
//         res.json(listings);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

async function startScrape() {
    for (let i = 0; i < sites.length; i++) {
        const s = new Scraper(sitesConfig[sites[i]], db);
        await s.scrape();
    }
}

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});

process.on('SIGINT', async () => {
    await db.close();
    process.exit(0);
});