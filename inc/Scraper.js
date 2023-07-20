const puppeteer = require('puppeteer');
const { getRandomTimeout, sleep, listingExists } = require('./helpers');
const andeleScraper = require('./sites/andeleScraper');
const ssScraper = require('./sites/ssScraper');

class Scraper {
    async scrape(config) {
        const browser = await puppeteer.launch({
            headless: "new",
        });

        const page = await browser.newPage();

        for (const link of config) {
            if (link.includes('andelemandele.lv')) {
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

                for (const url of allLinks) {
                    const exists = await listingExists(url);
                    if (exists) {
                        console.log(`${url} : ALREADY EXISTS`);
                        continue;
                    }
                    const delay = getRandomTimeout(1, 2);

                    await andeleScraper(url);

                    await sleep(delay);
                }
            }

            if (link.includes('ss.lv')) {
                await page.goto(link);

                await page.waitForSelector('.td2', { visible: true });
                const lastPageLink = await page.$eval('div.td2 > a:nth-child(1)', el => el.getAttribute('href'));
                const regex = /(\d+)\.html$/;
                const match = lastPageLink.match(regex);
                let totalPages = match ? parseInt(match[1]) : null;
                totalPages = 1;
                let allLinks = [];

                for (let i = 1; i <= totalPages; i++) {
                    const delay = getRandomTimeout(1, 2);
                    let pageURL = `https://www.ss.lv/lv/electronics/phones/mobile-phones/apple/sell/page${i}.html`;
                    if (i === 1) {
                        pageURL = `https://www.ss.lv/lv/electronics/phones/mobile-phones/apple/sell/`;
                    }

                    await page.goto(pageURL);

                    await page.waitForSelector('.top_head');

                    const links = await page.$$eval('.d1 .am', elements => elements.map(el => el.href));

                    allLinks.push(...links);

                    await sleep(delay);
                }

                for (const url of allLinks) {
                    const exists = await listingExists(url);
                    if (exists) {
                        console.log(`${url} : ALREADY EXISTS`);
                        continue;
                    }

                    const delay = getRandomTimeout(1, 2);

                    await ssScraper(url);

                    await sleep(delay);
                }
            }

            if (link.includes('facebook.com')) {
                await page.goto(link);
            }
        };

        await browser.close();
    }
}

module.exports = Scraper;
