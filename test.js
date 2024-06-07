const puppeteer = require('puppeteer-extra');
const andeleScraper = require('./inc/sites/andeleScraper');

async function start() {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 250,
      });

    andeleScraper('https://www.andelemandele.lv/perle/10934608/iphone-14-magsafe-case/', browser)
}

start();
