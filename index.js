const express = require('express');
const cron = require('node-cron');
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

async function startScrape() {
    for (let i = 0; i < sites.length; i++) {
        const s = new Scraper(sitesConfig[sites[i]], db);
        await s.scrape();
    }
}

cron.schedule('* * * * *', async () => {
    console.log('Running the scraping job');
    try {
        await startScrape();
    } catch (error) {
        console.error('Error during scheduled scraping:', error);
    }
});


app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});

process.on('SIGINT', async () => {
    await db.close();
    process.exit(0);
});