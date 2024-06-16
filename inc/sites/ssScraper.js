const ModelManager = require('../inc/ModelManager');
const { sendToDiscord } = require('../helpers');

async function ssScraper(url, browser, db) {
    const page = await browser.newPage();

    await page.goto(url, { timeout: 0 });

    const args = {
        url: url,
        site: 'ss',
    }

    const listing = await page.evaluate((args) => {
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

        const blacklistedWords = [
            'lombards',
            'lombardā',
            'filiāle',
            'filiālē',
            'banknote',
            'internetveikals',
            'internetveikalā',
            'Pērkam visus',
            'pērkam visus'
        ]

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

        let createdAt = document.querySelector('#page_main > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2)');
        if (createdAt) {
            createdAt = createdAt.textContent.trim();
            createdAt = parseDateString(createdAt);
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
        listingObject.createdAt = createdAt.toLocaleString('en-GB', { timeZone: 'Europe/Riga' });

        if (listingObject.price < 50) {
            listingObject.skip = true;
        }

        if (isBlacklisted) {
            listingObject.skip = true;
        }

        return listingObject;

    }, args);

    if (!listing.skip) {
        const modelData = new ModelManager(listing).findModel();

        if (modelData.id) {
            await db.saveListing({
                model: modelData.model[0],
                modelId: modelData.id,
                series: modelData.series,
                price: listing.price,
                memory: listing.memory,
                url: listing.url,
                site: listing.site,
                createdAt: listing.createdAt,
                status: 'listing_scraped',
            });

            if((Math.abs(listing.price - modelData.price) <= 125)) {
                data = {
                    description: listing.description,
                    model: modelData.model[0],
                    targetPrice: modelData.price,
                    price: listing.price,
                    memory: listing.memory,
                    url: listing.url,
                    createdAt: listing.createdAt,
                }
                try {
                    await sendToDiscord(data);
                } catch (error) {
                    console.error('Error', error);
                }
            }
        } else {
            await db.saveListing({
                url: listing.url,
                site: listing.site,
                status: 'listing_missing_model',
            });
        }
    } else {
        await db.saveListing({
            url: listing.url,
            site: listing.site,
            status: 'listing_skipped',
        });
    }

    await page.close();
}

module.exports = ssScraper;
