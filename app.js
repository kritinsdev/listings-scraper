const cron = require('node-cron');
const Scraper = require('./inc/Scraper');
const config = require('./siteConfig');

function printStartText() {
    console.log("Scraping is starting...");
}

// cron.schedule('*/5 * * * *', () => {
//     printStartText();
//     startScrape();
// });

async function startScrape() {
    const scraper = new Scraper();
    await scraper.scrape(config);
}

    startScrape();
