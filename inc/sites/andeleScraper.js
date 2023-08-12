const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { saveListing, saveToBlacklist } = require('../saveListing');
const ModelManager = require('../ModelManager');
puppeteer.use(StealthPlugin());

async function andeleScraper(url, browser) {
    const page = await browser.newPage();

    await page.goto(url);

    const args = {
        url: url,
    }

    const listingData = await page.evaluate((args) => {
        const listingObject = {};

        const unavailable = document.querySelector('.block-404__logo');
        if (unavailable) {
            listingObject.skip = true;
            listingObject.skipReason = 'Listing is sold or removed';
            return listingObject;
        }

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

        function findMemory(string) {
            if (!string) return null;
            const ft = string.toLowerCase();
            const regexGB = new RegExp('(\\d+)\\s*gb\\b', 'i');
            const regexTB = new RegExp('(\\d+)\\s*tb\\b', 'i');
        
            const hasMatchGB = ft.match(regexGB);
            const hasMatchTB = ft.match(regexTB);
        
            if (hasMatchTB) {
                return parseInt(hasMatchTB[1]) * 1024;
            }
        
            if (hasMatchGB) {
                return parseInt(hasMatchGB[1]);
            }
        
            return null;
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
        const formattedDescription = (description) ? description.replace(/[\n+]/g, ' ') : null;

        // Title
        let title = document.querySelector('.product__title');
        const spanElements = title.querySelectorAll('span');
        spanElements.forEach(spanElement => {
            spanElement.remove();
        });
        title = title.textContent.replace(/\t|\n/g, '');

        listingObject.site = 'andelemandele';
        listingObject.model_id = null;
        listingObject.url = args.url;
        listingObject.full_title = title;
        listingObject.description = formattedDescription;
        listingObject.memory = findMemory(title) ? findMemory(title) : findMemory(formattedDescription);
        listingObject.price = parseFloat(formattedPrice);

        const dataRows = document.querySelectorAll('.attribute-list > tbody > tr');
        for (let i = 0; i < dataRows.length; i++) {
            const propName = dataRows[i].querySelector('td:first-child');
            const propValue = dataRows[i].querySelector('td:last-child');

            if (propName.textContent == 'Pievienots') {
                const date = parseDate(propValue.textContent.trim());
                listingObject.added = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
            }
        }

        if (listingObject.price < 50) {
            listingObject.skip = true;
            listingObject.skipReason = `Price is less than 50 euros / URL: ${args.url}`;
            return listingObject;
        }

        return listingObject;
    }, args);

    if (!listingData.skip) {
        listingData.model_id = new ModelManager(listingData).findId();

        if (listingData.model_id) {
            try {
                await saveListing(listingData);
            } catch (error) {
                console.error('Error while saving data to DB', error);
            }
        } else {
            console.log(`===> MODEL NOT FOUND | TITLE: ${listingData.full_title} / URL: ${listingData.url}`)
            await saveToBlacklist(listingData);
        }
    } else {
        await saveToBlacklist(listingData);
    }

    await page.close();
}

module.exports = andeleScraper;
