const puppeteer = require('puppeteer');
const { getRandomTimeout, sleep, getExistingUrls } = require('./helpers');

class Scraper {
    constructor(config) {
        this.siteConfig = config;
        this.scrapedListingUrls = [];
        this.currentSite = this.siteConfig.sitename;
        this.firstPage = (this.siteConfig.categories) ? this.siteConfig.categories['phone'] : null;
        this.scrapeOnlyFirstPage = this.siteConfig['scrapeOnlyFirst'];
        this.existingListingUrls = [];

        console.log(`Starting scraping on: ${this.currentSite}`);
    }

    async scrape() {
        const browser = await puppeteer.launch({
            headless: "new",
        });

        const urlsPlaceholder = await getExistingUrls(this.currentSite);
        this.existingListingUrls = urlsPlaceholder.map(url => url.url);

        const page = await browser.newPage();

        await page.goto(this.firstPage);

        await this.collectUrls(page, await this.getTotalPages(page));

        let existingUrlsSet = new Set(this.existingListingUrls);
        let newLinks = this.scrapedListingUrls.filter(url => !existingUrlsSet.has(url));
        if (newLinks.length > 0) {
            console.log(`${newLinks.length} new listings. Scraping...`)
        } else {
            console.log('No new listings');
        }

        for (const url of newLinks) {
            const delay = getRandomTimeout(5, 10);

            await this.siteConfig.scraper(url);

            await sleep(delay);
        }
        await browser.close();
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
                if(!this.scrapeOnlyFirstPage) {
                    return parseInt(match[1]);
                }
                return 1;
            default:
                break;
        }
    }

    async collectUrls(page, totalPages) {
        switch (this.currentSite) {
            case 'andelemandele':
                for (let i = 0; i < totalPages; i++) {
                    const delay = getRandomTimeout(1, 2);
                    const pageUrl = (i === 0) ? this.firstPage : `${this.firstPage}/page:${i}`;
                    await page.goto(pageUrl);
                    await page.waitForSelector('.products .product-card__link');
                    const links = await page.$$eval('.products .product-card__link', elements => elements.map(el => el.href));
                    this.scrapedListingUrls.push(...links);
                    await sleep(delay);
                }
                break;

            case 'ss':
                for (let i = 1; i <= totalPages; i++) {
                    const delay = getRandomTimeout(1, 2);
                    const pageUrl = (i === 1) ? this.firstPage : `${this.firstPage}/page${i}.html`;
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
