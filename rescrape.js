const puppeteer = require('puppeteer');
const { getRandomTimeout, sleep, getExistingUrls } = require('./inc/helpers');
const { updateListing } = require('./inc/updateListing');

async function rescrape() {
    const browser = await puppeteer.launch({
        headless: "new",
    });
    const page = await browser.newPage();

       // Log in before the loop
    //    await page.goto('https://www.example.com/login');
    //    await page.type('input#username', 'my_username');
    //    await page.type('input#password', 'my_password');
    //    await Promise.all([
    //      page.waitForNavigation(),
    //      page.click('button#submit'),
    //    ]);
   

    const existingUrls = await getExistingUrls();

    for (let i = 0; i < existingUrls.length; i++) {
        const delay = getRandomTimeout(1,2);
        const id = existingUrls[i].id;

        if (existingUrls[i].url.includes('andelemandele.lv')) {
            await page.goto(existingUrls[i].url, {waitUntil: 'networkidle0'});

            const listing = await page.evaluate((id) => {
                const data = {};
                data.active = 1;
                data.id = id;

                //404
                const unavailable = document.querySelector('.block-404__logo');
                const sold = document.querySelector('.alert-info'); // wait for this selector

                // Price
                const price = document.querySelector('.product__price');
                const oldPrice = (price) ? price.querySelector('s') : null;
                if (oldPrice) {
                    oldPrice.remove();
                }

                const formattedPrice = (price) ? price.textContent.replace(/[^0-9.]+/g, '') : null;

                if (unavailable) {
                    data.active = 0;
                }

                if (formattedPrice) {
                    data.price = parseFloat(formattedPrice);
                }

                return data;

            }, id);

            if (listing) {
                try {
                    console.log(listing);
                    // await updateListing(listing);
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