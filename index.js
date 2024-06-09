const express = require('express');
const Database = require('./inc/models/Database');
const Scraper = require('./inc/Scraper');
const {sitesConfig, sites} = require('./siteConfig');

const app = express();
const port = process.env.PORT || 4000;

app.get('/', (req, res) => {
    res.send('Listings app');
  })

app.get('/scrape23hashed', async (req, res) => {
    try {
        await start();
        res.status(200).send('Scraping started');
    } catch (error) {
        console.error('Error during scraping:', error);
        res.status(500).send('An error occurred while scraping.');
    }
});

async function start() {
    const db = new Database(process.env.MONGO_URI);
    await db.connect();

    for (let i = 0; i < sites.length; i++) {
        const s = new Scraper(sitesConfig[sites[i]], db);
        await s.scrape();
    }

    await db.close();
}


app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});