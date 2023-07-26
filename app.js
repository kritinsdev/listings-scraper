const cron = require('node-cron');
const Scraper = require('./inc/Scraper');
const {sitesConfig, sites} = require('./siteConfig');

cron.schedule('*/3 * * * *', () => {
    console.log('Cron job started at', new Date().toLocaleString());
    startScrape();
});

async function startScrape() {
    for(let i = 0; i < sites.length; i++) {
        const SCRAPER = new Scraper(sitesConfig[sites[i]]);
        await SCRAPER.scrape();
    }
}

startScrape();
