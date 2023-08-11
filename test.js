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
    const browser = await puppeteer.launch({
        headless: "new",
    });

    andeleScraper('https://www.andelemandele.lv/perle/8822290/iphone-12-128-gb-balts/', browser);
}

start();
