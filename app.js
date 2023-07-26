const cron = require('node-cron');
const Scraper = require('./inc/Scraper');
const {sitesConfig, sites} = require('./siteConfig');

// cron.schedule('*/1 * * * *', () => {
//     console.log('Cron job started at', new Date().toLocaleString());
//     startScrape();
// });

async function startScrape() {
    for(let i = 0; i < sites.length; i++) {
        new Scraper(sitesConfig[sites[i]]);
    }
}

startScrape();