const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { getRandomTimeout, sleep, getExistingUrls } = require('./inc/helpers');
const { updateListing } = require('./inc/updateListing');
puppeteer.use(StealthPlugin());

async function rescrape() {
    const browser = await puppeteer.launch({
        headless: false,
    });
    const page = await browser.newPage();

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

    const existingUrls = await getExistingUrls('andelemandele');

    for (let i = 0; i < existingUrls.length; i++) {
        const delay = getRandomTimeout(1, 3);
        const id = existingUrls[i].id;

        await page.goto(existingUrls[i].url, { waitUntil: 'networkidle0' });

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
                console.log(listing);
                await updateListing(listing);
                console.log(`--------------`);
            } catch (error) {
                console.error('Error while saving data to DB', error);
            }
        }

        await sleep(delay);
    }

    await browser.close();
}


async function run() {
    await rescrape();
}

run();