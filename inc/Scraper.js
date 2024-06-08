const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { getRandomTimeout, sleep, getExistingUrls, getBlacklistUrls } = require('./helpers');
puppeteer.use(StealthPlugin());

class Scraper {
    constructor(config) {
        this.siteConfig = config;
        this.currentSite = this.siteConfig.sitename;
        this.pageUrl = this.siteConfig.url;
        this.scrapeOnlyFirstPage = this.siteConfig['scrapeOnlyFirst'];
        this.scrapedListingUrls = [];
        this.existingListingUrls = [];

        this.loadExistingUrls();
    }

    async scrape() {
        const browser = await puppeteer.launch({
            headless: "new",
        });

        const page = await browser.newPage();

        await page.goto(this.pageUrl);

        await this.collectUrls(page, await this.getTotalPages(page), this.pageUrl);

        let newLinks = this.scrapedListingUrls.filter(url => !this.existingListingUrls.includes(url));

        if (newLinks.length > 0) {
            console.log(`${newLinks.length} new listings. Scraping...`)
        } else {
            console.log('No new listings');
        }

        for (const url of newLinks) {
            const delay = getRandomTimeout(2, 4);

            await this.siteConfig.scraper(url, browser);

            await sleep(delay);
        }

        this.updateUrlsFile();
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

                const jsonUrls = JSON.stringify(this.scrapedListingUrls, null, 2);
                try {
                    fs.writeFileSync(`${this.currentSite}-urls.json`, jsonUrls, 'utf8');
                } catch (err) {
                    console.log(err);
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

    updateUrlsFile() {
        const allUrls = [...new Set([...this.existingListingUrls, ...this.scrapedListingUrls])];
        const jsonUrls = JSON.stringify(allUrls, null, 2);
        try {
            fs.writeFileSync(`${this.currentSite}-urls.json`, jsonUrls, 'utf8');
        } catch (err) {
            console.log('Error writing to URLs file:', err);
        }
    }

    loadExistingUrls() {
        try {
            const data = fs.readFileSync(`${this.currentSite}-urls.json`, 'utf8');
            this.existingListingUrls = JSON.parse(data);
        } catch (error) {
            console.log('No existing URLs file found or error reading file.');
            this.existingListingUrls = [];
        }
    }
}

module.exports = Scraper;
