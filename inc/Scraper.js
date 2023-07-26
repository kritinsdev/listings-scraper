const puppeteer = require('puppeteer');
const { getRandomTimeout, sleep, getExistingUrls } = require('./helpers');

class Scraper {
    constructor(config) {
        this.siteConfig = config;

        // this.scrape();
    }

    async scrape() {
        const browser = await puppeteer.launch({
            headless: "new",
        });

        // const existingUrls = await getExistingUrls();
        const page = await browser.newPage();

        await page.goto(link);

        await page.waitForSelector('.paginator', { visible: true });
        let totalPages = await page.$eval('.paginator', el => el.getAttribute('data-total'));
        totalPages = 1;
        let allLinks = [];

        for (let i = 0; i < totalPages; i++) {
            const delay = getRandomTimeout(1, 2);
            let pageURL = `https://www.andelemandele.lv/perles/elektronika/telefoni/#order:created/brand:3232/page:${i}`;
            if (i === 0) {
                pageURL = `https://www.andelemandele.lv/perles/elektronika/telefoni/#order:created/brand:3232`;
            }

            await page.goto(pageURL);
            await page.waitForSelector('.products .product-card__link');
            const links = await page.$$eval('.products .product-card__link', elements => elements.map(el => el.href));
            allLinks.push(...links);
            await sleep(delay);
        }


        let existingUrlsSet = new Set(existingUrls);
        let newLinks = allLinks.filter(url => !existingUrlsSet.has(url));
        if (newLinks.length > 0) {
            console.log(`${newLinks.length} new listings. Scraping...`)
        } else {
            console.log('No new listings');
        }

        for (const url of newLinks) {
            const delay = getRandomTimeout(5, 10);
            await andeleScraper(url);
            await sleep(delay);
        }

        await browser.close();
    }
}

module.exports = Scraper;
