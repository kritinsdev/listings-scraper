const puppeteer = require('puppeteer');
const { saveListing } = require('../saveToDb');
const { models, modelIds } = require('../helpers')

async function andeleScraper(url) {

    const browser = await puppeteer.launch({
        args: [
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--single-process",
            "--no-zygote",
        ],
        executablePath: process.env.NODE_ENV === "production" ? process.envPUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath()
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

        function findMemory(string) {
            const ft = string.toLowerCase();
            const regex = new RegExp('(\\d+)\\s*gb\\b', 'i');
            const hasMatch = ft.match(regex);
            return hasMatch ? parseInt(hasMatch[1]) : null;
        }

        function findBatteryCapacity(string) {
            const ft = string.toLowerCase();
            const regex = new RegExp('(\\d+)\\s*%', 'i');
            const hasMatch = ft.match(regex);
            return hasMatch ? parseInt(hasMatch[1]) : null;
        }

        const unavailable = document.querySelector('.block-404__logo');
        if(unavailable) {
            return false;
        }

        const listingObject = {};

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
        let phoneModel = findModel(title) ? findModel(title) : findModel(formattedDescription);

        //Capacity
        let memory = findMemory(title) ? findMemory(title) : findMemory(formattedDescription);

        //Battery capacity
        let batteryCapacity = findBatteryCapacity(formattedDescription);

        listingObject.url = url;
        listingObject.price = parseFloat(formattedPrice);
        listingObject.model_id = modelIds[phoneModel];
        
        if(memory && !isNaN(memory)) {
            listingObject.memory = parseInt(memory);
        }

        if (batteryCapacity && !isNaN(batteryCapacity)) {
            listingObject.battery_capacity = parseInt(batteryCapacity);
        }

        const dataRows = document.querySelectorAll('.attribute-list > tbody > tr');
        for (let i = 0; i < dataRows.length; i++) {
            const propName = dataRows[i].querySelector('td:first-child');
            const propValue = dataRows[i].querySelector('td:last-child');

            if (propName.textContent == 'Pievienots') {
                const date = parseDate(propValue.textContent.trim());
                listingObject.added = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
            }
        }

        if(!phoneModel || !listingObject.model_id || listingObject.price < 50) {
            listingObject.skip = true;
        }

        return listingObject;

    }, url, models, modelIds);

    if (!listingData.skip) {
        try {
            // await saveListing(listingData);
        } catch (error) {
            console.error('Error while saving data to DB', error);
        }
    } else {
        console.log('SKIPPING: ' + listingData.url);
    }

    await browser.close();
}

module.exports = andeleScraper;
