const cron = require('node-cron');
const Scraper = require('./inc/Scraper');
const config = require('./siteConfig');

cron.schedule('0 */2 * * *', () => {
    startScrape();
});

async function startScrape() {
    const scraper = new Scraper();
    await scraper.scrape(config);
}