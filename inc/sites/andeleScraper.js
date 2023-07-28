const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { saveListing, saveToBlacklist } = require('../saveListing');
const { models, modelIds } = require('../helpers')
puppeteer.use(StealthPlugin());

async function andeleScraper(url) {

    const browser = await puppeteer.launch({
        headless: "new",
    });

    const page = await browser.newPage();

    await page.goto(url);

    const listingData = await page.evaluate((url, models, modelIds) => {
        const monthNames = {
            'janvāris': 0,
            'februāris': 1,
            'marts': 2,
            'aprīlis': 3,
            'maijs': 4,
            'jūnijs': 5,
            'jūlijs': 6,
            'augusts': 7,
            'septembris': 8,
            'oktobris': 9,
            'novembris': 10,
            'decembris': 11,
        };

        function parseDate(dateString) {
            const today = new Date();

            if (dateString.startsWith('Šodien')) {
                const time = dateString.split(',')[1].trim().split(':');
                return new Date(today.getFullYear(), today.getMonth(), today.getDate(), +time[0], +time[1]);
            }

            if (dateString.startsWith('Vakar')) {
                const time = dateString.split(',')[1].trim().split(':');
                return new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, +time[0], +time[1]);
            }

            const parts = dateString.split(', ');
            const dateParts = parts[0].split('. ');
            const day = parseInt(dateParts[0], 10);
            const month = monthNames[dateParts[1]];
            const timeParts = parts[1].split(':');
            const hour = parseInt(timeParts[0], 10);
            const minute = parseInt(timeParts[1], 10);

            return new Date(today.getFullYear(), month, day, hour, minute);
        }

        function findModel(string) {
            const formattedText = string.toLowerCase();
            const regex = new RegExp(
                `(${models.join('|').replace(/\s+/g, '\\s')})(?![0-9])`,
                'gi'
            );
            const match = formattedText.match(regex);
            return match ? match[0] : null;
        }
  
        const listingObject = {};
        listingObject.url = url;
        listingObject.site = 'andelemandele';

        const unavailable = document.querySelector('.block-404__logo');
        if(unavailable) {
            listingObject.skip = true;
            listingObject.skipReason = '404 listing is sold or removed';
            return listingObject;
        }

        // Price
        const price = document.querySelector('.product__price');
        const oldPrice = price.querySelector('s');
        if (oldPrice) {
            oldPrice.remove();
        }
        const formattedPrice = price.textContent.replace(/[^0-9.]+/g, '');

        // Description
        const description = document.querySelector('.product__descr').textContent.trim();
        const formattedDescription = description.replace(/[\n+]/g, ' ');

        // Title
        let title = document.querySelector('.product__title');
        const spanElements = title.querySelectorAll('span');
        spanElements.forEach(spanElement => {
            spanElement.remove();
        });
        title = title.textContent.replace(/\t|\n/g, '');

        //Model 
        let listingModel = findModel(title) ? findModel(title) : findModel(formattedDescription);


        listingObject.price = parseFloat(formattedPrice);
        listingObject.model_id = modelIds[listingModel];
        listingObject.category_id = 1;


        const dataRows = document.querySelectorAll('.attribute-list > tbody > tr');
        for (let i = 0; i < dataRows.length; i++) {
            const propName = dataRows[i].querySelector('td:first-child');
            const propValue = dataRows[i].querySelector('td:last-child');

            if (propName.textContent == 'Pievienots') {
                const date = parseDate(propValue.textContent.trim());
                listingObject.added = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
            }
        }

        if(!listingModel || !listingObject.model_id) {
            listingObject.skip = true;
            listingObject.skipReason = `Could not find model / URL: ${url}`;
        }

        if(listingObject.price < 50) {
            listingObject.skip = true;
            listingObject.skipReason = `Price is less than 50 euros / URL: ${url}`;
        }

        return listingObject;

    }, url, models, modelIds);

    if (!listingData.skip) {
        try {
            await saveListing(listingData);
        } catch (error) {
            console.error('Error while saving data to DB', error);
        }
    } else {
        await saveToBlacklist(listingData);
    }

    await browser.close();
}

module.exports = andeleScraper;
