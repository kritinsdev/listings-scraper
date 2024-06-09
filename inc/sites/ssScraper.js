const ModelManager = require('../inc/ModelManager');
const { sendToDiscord } = require('../helpers');

async function ssScraper(url, browser, db) {
    const page = await browser.newPage();

    await page.goto(url, {
        waitUntil: 'load',
        timeout: 0
    });

    const args = {
        url: url,
        site: 'ss',
    }

    const listingData = await page.evaluate((args) => {
        function parseDateString(dateString) {
            const cleanedDateString = dateString.replace('Datums: ', '');

            const [datePart, timePart] = cleanedDateString.split(' ');

            const [day, month, year] = datePart.split('.');

            const [hours, minutes] = timePart.split(':');

            const isoString = `${year}-${month}-${day}T${hours}:${minutes}`;

            const date = new Date(isoString);

            return date;
        }

        const listingObject = {};
        listingObject.url = args.url;
        listingObject.site = args.site;

        const blacklistedWords = ['lombards', 'lombardā', 'filiāle', 'filiālē', 'banknote', 'internetveikals', 'internetveikalā', 'Pērkam visus', 'pērkam visus']

        let price = document.querySelector('.ads_price');

        if (price) {
            price = price.textContent.replace(/\D/g, '');
            price = parseFloat(price);
        }

        let memory = document.querySelector('#tdo_42');
        if (memory) {
            memory = memory.textContent;
            memory = parseInt(memory);
        }

        let description = document.querySelector('#msg_div_msg');
        if (description) {
            description = description.textContent.replace(/[\n+]/g, ' ').trim().toLowerCase();
        }

        const isBlacklisted = blacklistedWords.some(word => description.includes(word.toLowerCase()));

        let model = document.querySelector('#tdo_44');

        if (model) {
            model = model.textContent.trim();
            model = model.replace(/apple /gi, "");
        }

        let added = document.querySelector('#page_main > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2)');
        if (added) {
            added = added.textContent.trim();
            added = parseDateString(added);
        }

        let element = document.querySelector('#msg_div_msg');

        let tables = element.getElementsByTagName('table');
        while (tables[0]) {
            tables[0].parentNode.removeChild(tables[0]);
        }
        let text = element.innerText;
        text = text.replace(/\n{2,}/g, '\n');

        listingObject.site = 'ss';
        listingObject.url = args.url;
        listingObject.price = price;
        listingObject.modelId = null;
        listingObject.memory = memory;
        listingObject.description = text;
        listingObject.fullTitle = model;

        listingObject.added = new Date(added.getTime() - added.getTimezoneOffset() * 60000).toISOString();

        if (listingObject.price < 25) {
            listingObject.skip = true;
            listingObject.skipReason = `Price is less than 25 euros / URL: ${args.url}`;
        }

        if (!listingObject.model_id) {
            listingObject.skip = true;
            listingObject.skipReason = `Could not find model / URL: ${args.url}`;
        }

        if (isBlacklisted) {
            listingObject.skip = true;
            listingObject.skipReason = `Contains blacklisted word / URL: ${args.url}`;
        }

        return listingObject;

    }, args);

    if (!listingData.skip) {
        const modelData = new ModelManager(listingData).findModel();

        listingData.modelId = modelData.modelId;
        listingData.targetPrice = modelData.targetPrice;
        listingData.modelName = modelData.modelName;

        if (listingData.modelId) {
            if (Math.abs(listingData.price - listingData.targetPrice) <= 50) {
                await db.saveListing({
                    url: listingData.url,
                    site: listingData.site,
                    status: 'scraped',
                });
                try {
                    await sendToDiscord(listingData);
                } catch (error) {
                    console.error('Error', error);
                }
            } else {
                await db.saveListing({
                    url: listingData.url,
                    site: listingData.site,
                    status: 'scraped',
                });
            }
        } else {
            await db.saveListing({
                url: listingData.url,
                site: listingData.site,
                status: 'model_not_found',
            });
            console.log(`EXCLUDED MODEL | URL: ${listingData.url}`)
        }
    } else {
        await db.saveListing({
            url: listingData.url,
            site: listingData.site,
            status: 'listing_skipped',
        });
    }


    await page.close();
}

module.exports = ssScraper;
