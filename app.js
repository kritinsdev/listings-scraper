const cron = require('node-cron');
const Scraper = require('./inc/Scraper');
const {sitesConfig, sites} = require('./siteConfig');
const andeleScraper = require('./inc/sites/andeleScraper');

const puppeteer = require('puppeteer-extra');

// cron.schedule('*/1 * * * *', () => {
//     console.log('===================================================');
//     console.log('Cron job started at', new Date().toLocaleString());
//     start();
// });

async function start() {
    // for(let i = 0; i < sites.length; i++) {
    //     const ___XXX___ = new Scraper(sitesConfig[sites[i]]);
    //     await ___XXX___.scrape();
    // }
    const browser = await puppeteer.launch({
        headless: false,
    });
    andeleScraper('https://www.andelemandele.lv/perle/8722945/iphone-11-pro-64gb/', browser)
}


start();
