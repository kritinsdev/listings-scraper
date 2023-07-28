const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { getRandomTimeout, sleep, getExistingUrls, getBlacklistUrls } = require('./helpers');
const { updateListing } = require('./updateListing');
puppeteer.use(StealthPlugin());

class Scraper {
    constructor(config) {
        this.siteConfig = config;
        this.scrapedListingUrls = [];
        this.currentSite = this.siteConfig.sitename;
        this.firstPage = (this.siteConfig.categories) ? this.siteConfig.categories['phone'] : null;
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
        this.existingListingUrls = existingListingUrls.map(url => url.url);

        const page = await browser.newPage();

        await page.goto(this.firstPage);

        await this.collectUrls(page, await this.getTotalPages(page));

        let existingUrlsSet = new Set([...this.existingListingUrls, ...blacklistUrls]);

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
                if (!this.scrapeOnlyFirstPage) {
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

    async checkUrlsForUpdates() {
        const browser = await puppeteer.launch({
            headless: "new",
        });
        const page = await browser.newPage();

        if (this.currentSite === 'andelemandele') {
            await this.loginAndele(page);
        }

        const existingUrls = await getExistingUrls(this.currentSite);

        for (let i = 0; i < existingUrls.length; i++) {
            const delay = getRandomTimeout(1, 3);
            const id = existingUrls[i].id;

            await page.goto(existingUrls[i].url, { waitUntil: 'networkidle0' });

            if (this.currentSite === 'andelemandele') {
                const listing = await page.evaluate((id) => {
                    const listing = {};
                    listing.active = 1;
                    listing.id = id;

                    //Checks
                    const unavailable = document.querySelector('.block-404__logo');
                    let sold = document.querySelector('.alert-info'); // wait for this selector
                    sold = (sold) ? sold.textContent.trim() : null;
                    // Price
                    const price = document.querySelector('.product__price');
                    const oldPrice = (price) ? price.querySelector('s') : null;
                    if (oldPrice) {
                        oldPrice.remove();
                    }

                    const formattedPrice = (price) ? price.textContent.replace(/[^0-9.]+/g, '') : null;

                    if (formattedPrice) {
                        listing.price = parseFloat(formattedPrice);
                    }

                    // if(response.status() === 404){
                    //     listing.active = 0;
                    //     listing.info = `404: Listing is removed / ID:${listing.id}`;
                    // }

                    if (unavailable) {
                        listing.active = 0;
                        listing.info = `404: Listing is removed / ID:${listing.id}`;
                    }

                    if (sold && sold.toLowerCase() == 'šī pērle ir nomedīta.') {
                        listing.active = 0;
                        listing.info = `${sold} / ID:${listing.id}`;
                    }

                    return listing;
                }, id);

                if (listing) {
                    try {
                        await updateListing(listing);
                    } catch (error) {
                        console.error('Error while saving data to DB', error);
                    }
                }
            }

            if (this.currentSite === 'ss') {
                const listing = await page.evaluate((id) => {
                    const listing = {};
                    listing.id = id;
                    listing.active = 1;

                    // Price
                    let price = (document.querySelector('.ads_price')) ? document.querySelector('.ads_price').textContent : null;

                    //Archive
                    let archive = (document.querySelector('img[src="https://i.ss.lv/img/a_lv.gif"]')) ? true : false;

                    if (price) {
                        price = price.replace(/\D/g, '');
                        price = parseFloat(price);
                        listing.price = price;
                    }

                    // if(response.status() === 404){
                    //     listing.active = 0;
                    //     listing.info = `404: Listing is removed / ID:${listing.id}`;
                    // }

                    if (!price) {
                        listing.active = 0;
                        listing.info = `Listing missing price / ID:${listing.id}`;
                    }

                    if (archive) {
                        listing.active = 0;
                        listing.info = `Listing is in archvie / ID:${listing.id}`;
                    }

                    return listing;
                }, id);

                if (listing) {
                    try {
                        await updateListing(listing);
                    } catch (error) {
                        console.error('Error while saving data to DB', error);
                    }
                }
            }

            await sleep(delay);
        }

        await browser.close();
    }

    async loginAndele(page) {
        let delay = getRandomTimeout(1, 3);
        await page.goto('https://www.andelemandele.lv/login/authorize/google/?back=%2F');
        await sleep(delay);

        delay = getRandomTimeout(1, 3);
        await page.type('input#identifierId', process.env.GMAIL_USERNAME);
        await sleep(delay);

        await Promise.all([
            page.waitForNavigation(),
            page.click('#identifierNext > div > button'),
        ]);
        await sleep(delay);

        delay = getRandomTimeout(1, 3);
        await page.type('#password > div.aCsJod.oJeWuf > div > div.Xb9hP > input', process.env.GMAIL_PASSWORD);
        await sleep(delay);


        delay = getRandomTimeout(1, 3);
        await Promise.all([
            page.waitForNavigation(),
            page.click('#passwordNext > div > button'),
        ]);
        await sleep(delay);
    }
}

module.exports = Scraper;
