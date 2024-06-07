const cron = require('node-cron');
const Scraper = require('./inc/Scraper');
const {sitesConfig, sites} = require('./siteConfig');

cron.schedule('*/30 * * * *', () => {
    console.log('===================================================');
    console.log('Cron job started at', new Date().toLocaleString());
    start();
});

async function start() {
    for(let i = 0; i < sites.length; i++) {
        const phoneScraper = new Scraper(sitesConfig[sites[i]]);

        await phoneScraper.scrape();
    }
}

start();
