const puppeteer = require('puppeteer');
const { getRandomTimeout, sleep, getExistingUrls } = require('./inc/helpers');
const { updateListing } = require('./inc/updateListing');

async function rescrape() {
    const browser = await puppeteer.launch({
        headless: "new",
    });
    const page = await browser.newPage();

    const existingUrls = await getExistingUrls();

    for (let i = 0; i < existingUrls.length; i++) {
        const delay = getRandomTimeout(1,2);
        const id = existingUrls[i].id;

        if (existingUrls[i].url.includes('andelemandele.lv')) {
            await page.goto(existingUrls[i].url);

            const listing = await page.evaluate((id) => {
                const data = {};
                data.id = id;

                //404
                const unavailable = document.querySelector('.block-404__logo');

                // Price
                const price = document.querySelector('.product__price');
                const oldPrice = (price) ? price.querySelector('s') : null;
                if (oldPrice) {
                    oldPrice.remove();
                }

                const formattedPrice = (price) ? price.textContent.replace(/[^0-9.]+/g, '') : null;

                if (unavailable) {
                    data.active = 0;
                } else {
                    data.active = 1;
                }

                if (formattedPrice) {
                    data.price = parseFloat(formattedPrice);
                }

                return data;

            }, id);

            if (listing) {
                try {
                    await updateListing(listing);
                } catch (error) {
                    console.error('Error while saving data to DB', error);
                }
            }
        }

        if (existingUrls[i].url.includes('ss.lv')) {
            await page.goto(existingUrls[i].url);

            const listing = await page.evaluate((id) => {
                const data = {};
                data.id = id;
                data.active = 1;

                // Price
                let price = (document.querySelector('.ads_price')) ? document.querySelector('.ads_price').textContent : null;

                if (price) {
                    price = price.replace(/\D/g, '');
                    price = parseFloat(price);
                    data.price = price;
                }

                if (!price) {
                    data.active = 0;
                }

                return data;

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


async function run() {
    await rescrape();
}

run();