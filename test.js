const puppeteer = require('puppeteer-extra');
const facebookScraper = require('./inc/sites/facebookScraper');

async function start() {
    const browser = await puppeteer.launch({
        headless: false,
    });

    facebookScraper('https://www.facebook.com/marketplace/item/2476592459186022/?ref=category_feed&referral_code=null&referral_story_type=post', browser)
}

start();
