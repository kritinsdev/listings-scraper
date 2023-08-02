const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { saveListing, saveToBlacklist } = require('../saveListing');
const { models, modelIds } = require('../helpers')
puppeteer.use(StealthPlugin());

async function facebookScraper(url, browser) {
    const page = await browser.newPage();
    
    await page.goto(url);

    const listingData = await page.evaluate((args) => {
        const listingObject = {};
        return listingObject;

    }, args);

    if (!listingData.skip) {
        try {
            await saveListing(listingData);
        } catch (error) {
            console.error('Error while saving data to DB', error);
        }
    } else {
        await saveToBlacklist(listingData);
    }
}

module.exports = facebookScraper;
