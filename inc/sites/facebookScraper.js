const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { saveListing, saveToBlacklist } = require('../saveListing');
const { models } = require('../helpers')
puppeteer.use(StealthPlugin());

async function facebookScraper(url, browser) {
    const page = await browser.newPage();
    
    await page.goto(url);

    const TITLE = 'h1';
    try {
        await page.waitForSelector(TITLE, { timeout: 5000 });
    } catch (error) {
        console.error('Title selector not found:', error);
        return;
    }


    const listingData = await page.evaluate((titleSelector, modelSelector) => {
        const listingObject = {};
        const titleElement = document.querySelector(titleSelector);
        const modelElement = document.querySelectorAll('.x1e558r4.xp4054r.x3hqpx7 .xu06os2.x1ok221b .x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x6prxxf.xvq8zen.xo1l8bm.xzsf02u');
        const added = document.querySelector('.x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x4zkp8e.x676frb.x1nxh6w3.x1sibtaa.xo1l8bm.xi81zsa');

        if (titleElement) {
            listingObject.title = titleElement.textContent.trim();
        }

        if(modelElement[3]) {
            listingObject.model = modelElement[3].textContent.trim();
        }

        if(added) {
            listingObject.added = added.textContent.trim();
        }

        return listingObject;

    }, TITLE);

    if (listingData) {
        console.log(listingData);
        try {
            // await saveListing(listingData);
        } catch (error) {
            console.error('Error while saving data to DB', error);
        }
    } else {
        // await saveToBlacklist(listingData);
    }
}

module.exports = facebookScraper;
