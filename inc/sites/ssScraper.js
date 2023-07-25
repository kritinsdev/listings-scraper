const puppeteer = require('puppeteer');
const { saveListing } = require('../saveListing');
const { modelIds } = require('../helpers')

async function ssScraper(url) {

    const browser = await puppeteer.launch({
        headless: "new",
    });

    const page = await browser.newPage();

    await page.goto(url);

    const listingData = await page.evaluate((url, modelIds) => {

        function parseDateString(dateString) {
            const cleanedDateString = dateString.replace('Datums: ', '');
        
            const [datePart, timePart] = cleanedDateString.split(' ');
        
            const [day, month, year] = datePart.split('.');
        
            const [hours, minutes] = timePart.split(':');
        
            const isoString = `${year}-${month}-${day}T${hours}:${minutes}`;
        
            const date = new Date(isoString);
        
            return date;
        }

        function findBatteryCapacity(string) {
            const ft = string.toLowerCase();
            const regex = new RegExp('(\\d+)\\s*%', 'i');
            const hasMatch = ft.match(regex);
            return hasMatch ? parseInt(hasMatch[1]) : null;
        }

        const listingObject = {};
        const blacklistedWords = ['lombards', 'lombardā', 'filiāle', 'filiālē', 'banknote', 'internetveikals', 'internetveikalā', 'prece', 'preci', 'čeks', 'гарантия']

        // Price
        let price = document.querySelector('.ads_price').textContent;
        price = price.replace(/\D/g, '');
        price = parseFloat(price);

        // Description
        let description = document.querySelector('#msg_div_msg').textContent;
        description = description.replace(/[\n+]/g, ' ').trim().toLowerCase();
        const isBlacklisted = blacklistedWords.some(word => description.includes(word.toLowerCase()));

        //Model 
        let model = document.querySelector('#tdo_44').textContent;
        model = model.toLowerCase();
        model = model.replace(/apple iphone /gi, "");

        //Memory
        let memory = document.querySelector('#tdo_42').textContent;
        memory = parseInt(memory);

        //Battery capacity
        let batteryCapacity = findBatteryCapacity(description);

        //Date added 
        let added = document.querySelector('#page_main > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2)').textContent.trim();
        added = parseDateString(added);
        
        listingObject.url = url;
        listingObject.price = price;
        listingObject.model_id = modelIds[model]
        listingObject.memory = memory;

        if (batteryCapacity && !isNaN(batteryCapacity)) {
            listingObject.battery_capacity = parseInt(batteryCapacity);
        }

        listingObject.added = new Date(added.getTime() - added.getTimezoneOffset() * 60000).toISOString();

        if (listingObject.price < 50 || isBlacklisted) {
            listingObject.skip = true;
        }

        return listingObject;

    }, url, modelIds);

    if (!listingData.skip) {
        try {
            await saveListing(listingData);
        } catch (error) {
            console.error('Error while saving data to DB', error);
        }
    } else {
        console.log('SKIPPING: ' + listingData.url);
    }

    await browser.close();
}

module.exports = ssScraper;
