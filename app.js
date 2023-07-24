const cron = require('node-cron');
const Scraper = require('./inc/Scraper');
const config = require('./siteConfig');

// cron.schedule('*/1 * * * *', () => {
//     console.log('Cron job started at', new Date().toLocaleString());
//     startScrape();
// });

async function startScrape() {
    const scraper = new Scraper();
    await scraper.scrape(config);
}

startScrape();