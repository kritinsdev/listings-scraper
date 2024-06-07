const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { getRandomTimeout, sleep, getExistingUrls, getBlacklistUrls } = require('./helpers');
puppeteer.use(StealthPlugin());

class Scraper {
    constructor(config) {
        this.siteConfig = config;
        this.scrapedListingUrls = [];
        this.currentSite = this.siteConfig.sitename;
        this.pageUrl = this.siteConfig.url;
        this.scrapeOnlyFirstPage = this.siteConfig['scrapeOnlyFirst'];
        this.existingListingsFullUrls = null;
        this.existingListingUrls = [];

        console.log(`Starting scraping on: ${this.currentSite}`);
    }

    async scrape() {
        const browser = await puppeteer.launch({
            headless: "new",
        });

        let blacklistUrls = await getBlacklistUrls(this.currentSite);
        blacklistUrls = blacklistUrls.map(obj => obj.url);

        let existingListingUrls = await getExistingUrls(this.currentSite);
        this.existingListingUrls = existingListingUrls.map(obj => obj.url);

        let existingUrlsSet = new Set([...this.existingListingUrls, ...blacklistUrls]);

        const page = await browser.newPage();

        await page.goto(this.pageUrl);

        if(this.currentSite === 'facebook') {
            this.scrapedListingUrls = ['https://www.facebook.com/marketplace/item/621827286780032/?ref=category_feed&referral_code=null&referral_story_type=post']
            await this.loginFacebook(page);

            // await this.collectFbUrls(page)
        } else {
            await this.collectUrls(page, await this.getTotalPages(page), this.pageUrl);
        }

        let newLinks = this.scrapedListingUrls.filter(url => !existingUrlsSet.has(url));

        if (newLinks.length > 0) {
            console.log(`${newLinks.length} new listings. Scraping...`)
        } else {
            console.log('No new listings');
        }

        for (const url of newLinks) {
            console.log(url);
            const delay = getRandomTimeout(2, 4);

            await this.siteConfig.scraper(url, browser);

            await sleep(delay);
        }
        console.log('Finished scraping.')
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

    async collectFbUrls() {
        
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

    async loginFacebook(page) {
        let delay = getRandomTimeout(1, 3);
        await page.goto('https://www.facebook.com/');
        await sleep(delay);

        delay = getRandomTimeout(1, 3);
        await Promise.all([
            page.click('[data-cookiebanner="accept_button"]'),
        ]);
        await sleep(delay);

        delay = getRandomTimeout(1, 3);
        await page.type('[data-testid="royal_email"]', process.env.FB_USERNAME);
        await sleep(delay);

        delay = getRandomTimeout(1, 3);
        await page.type('[data-testid="royal_pass"]', process.env.FB_PASSWORD);
        await sleep(delay);

        delay = getRandomTimeout(1, 3);
        await Promise.all([
            page.click('[data-testid="royal_login_button"]'),
        ]);
        await sleep(delay);
    }
}

module.exports = Scraper;
