const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { saveListing, saveToBlacklist } = require('../saveListing');
const MM = require('../ModelManager');
puppeteer.use(StealthPlugin());

async function andeleScraper(url, browser, categoryId) {
    const page = await browser.newPage();

    await page.goto(url);

    const args = {
        url: url,
        category: categoryId
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
            if (!string) return;
            const ft = string.toLowerCase();
            const regex = new RegExp('(\\d+)\\s*gb\\b', 'i');
            const hasMatch = ft.match(regex);
            return hasMatch ? parseInt(hasMatch[1]) : null;
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

        //Location
        let location = document.querySelector(".product__location dd:nth-child(2)");
        location = (location) ? location.textContent.split(',')[0].trim() : null;

        listingObject.site = 'andelemandele';
        listingObject.category_id = args.category;
        listingObject.model_id = null;
        listingObject.url = args.url;
        listingObject.full_title = title;
        listingObject.description = formattedDescription;
        listingObject.memory = findMemory(title) ? findMemory(title) : findMemory(formattedDescription);
        listingObject.price = parseFloat(formattedPrice);
        listingObject.location = location;

        const dataRows = document.querySelectorAll('.attribute-list > tbody > tr');
        for (let i = 0; i < dataRows.length; i++) {
            const propName = dataRows[i].querySelector('td:first-child');
            const propValue = dataRows[i].querySelector('td:last-child');

            if (propName.textContent == 'Pievienots') {
                const date = parseDate(propValue.textContent.trim());
                listingObject.added = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
            }

            if (propName.textContent == 'Skatījumi') {
                const views = parseInt(propValue.textContent.trim());
                listingObject.views = views;
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
        const model = findModel(listingData);
        listingData.model_id = model;

        if (model) {
            try {
                await saveListing(listingData);
            } catch (error) {
                console.error('Error while saving data to DB', error);
            }
        } else {
            console.log(`===> MODEL NOT FOUND | TITLE: ${listingData.full_title} / URL: ${listingData.url}`)
        }

    } else {
        await saveToBlacklist(listingData);
    }

    await page.close();
}

function findModel(listingData) {
    let model = null;
    let listingModel = MM.findModel(listingData.full_title, listingData.category_id);
    if (!listingModel) listingModel = MM.findModel(listingData.description, listingData.category_id);
    if (listingModel) {
        model = MM.getModelId(listingData.category_id, listingModel);
    }

    return model;
}

module.exports = andeleScraper;
