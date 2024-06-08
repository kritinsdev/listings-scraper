const Scraper = require('./inc/Scraper');
const {sitesConfig, sites} = require('./siteConfig');

async function start() {
    for(let i = 0; i < sites.length; i++) {
        const s = new Scraper(sitesConfig[sites[i]]);
        await s.scrape();
    }
}

start();
