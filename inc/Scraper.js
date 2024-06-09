require('dotenv').config();
const puppeteer = require('puppeteer');
const { getRandomTimeout, sleep } = require('./helpers');

class Scraper {
    constructor(config, db) {
        this.db = db;
        this.siteConfig = config;
        this.currentSite = this.siteConfig.sitename;
        this.pageUrl = this.siteConfig.url;
        this.scrapeOnlyFirstPage = this.siteConfig['scrapeOnlyFirst'];
        this.scrapedListingUrls = [];
        this.existingListingUrls = [];
    }

    async scrape() {
        console.log('=============================');
        this.existingListingUrls = await this.db.fetchExistingUrls(this.currentSite);

        const browser = await puppeteer.launch({
            args: [
                "--disable-setuid-sandbox",
                "--no-sandbox",
                //   "--single-process",
                "--no-zygote",
            ],
            executablePath:
                process.env.NODE_ENV === "production"
                    ? process.env.PUPPETEER_EXECUTABLE_PATH
                    : puppeteer.executablePath(),
        });

        const page = await browser.newPage();

        await page.goto(this.pageUrl, {
            waitUntil: 'load',
            timeout: 0
        });

        await this.collectUrls(page, await this.getTotalPages(page), this.pageUrl);

        let newLinks = this.scrapedListingUrls.filter(url => !this.existingListingUrls.includes(url));

        console.log(`Scraping ${this.currentSite}`);
        if (newLinks.length > 0) {
            console.log(`${newLinks.length} new listings. Scraping...`)
        } else {
            console.log('No new listings');
        }

        for (const url of newLinks) {
            const delay = getRandomTimeout(2, 4);

            await this.siteConfig.scraper(url, browser, this.db);

            await sleep(delay);
        }

        await browser.close();
        console.log('Scraping finished');
        console.log('=============================');
    }

    async getTotalPages(page) {
        switch (this.currentSite) {
            case 'andelemandele':
                await page.waitForSelector(this.siteConfig.selectors['paginator'], { visible: true });
                return (!this.scrapeOnlyFirstPage) ? await page.$eval(this.siteConfig.selectors['paginator'], el => el.getAttribute('data-total')) : 1;
            case 'ss':
                await page.waitForSelector(this.siteConfig.selectors['paginator'], { visible: true });
                const lastPageLink = await page.$eval('div.td2 > a:nth-child(1)', el => el.getAttribute('href'));
                const regex = /(\d+)\.html$/;
                const match = lastPageLink.match(regex);
                if (!this.scrapeOnlyFirstPage) {
                    return parseInt(match[1]);
                }
                return 1;
            default:
                break;
        }
    }

    async collectUrls(page, totalPages, firstPage) {
        switch (this.currentSite) {
            case 'andelemandele':
                for (let i = 0; i < totalPages; i++) {
                    const delay = getRandomTimeout(1, 2);
                    const pageUrl = (i === 0) ? firstPage : `${firstPage}/page:${i}`;
                    try {
                        await page.goto(pageUrl);
                        await page.waitForSelector('.products .product-card__link');
                        const links = await page.$$eval('.products .product-card__link', elements => elements.map(el => el.href));
                        this.scrapedListingUrls.push(...links);
                        await sleep(delay);
                    } catch (error) {
                        console.log(error);
                    }
                }
                break;

            case 'ss':
                for (let i = 1; i <= totalPages; i++) {
                    const delay = getRandomTimeout(1, 2);
                    const pageUrl = (i === 1) ? firstPage : `${firstPage}/page${i}.html`;
                    await page.goto(pageUrl);
                    await page.waitForSelector('.top_head');
                    const links = await page.$$eval('.d1 .am', elements => elements.map(el => el.href));
                    this.scrapedListingUrls.push(...links);
                    await sleep(delay);
                }
                break;
            default:
                break;
        }
    }
}

module.exports = Scraper;
