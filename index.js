const express = require('express');
const Scraper = require('./inc/Scraper');
const {sitesConfig, sites} = require('./siteConfig');

const app = express();
const PORT = process.env.PORT || 4000;

app.get('/scrape', async (req, res) => {
    try {
        await start();
        res.status(200).send('Scraping started.');
    } catch (error) {
        console.error('Error during scraping:', error);
        res.status(500).send('An error occurred while scraping.');
    }
});

async function start() {
    for(let i = 0; i < sites.length; i++) {
        const s = new Scraper(sitesConfig[sites[i]]);
        await s.scrape();
    }
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});