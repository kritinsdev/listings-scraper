const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { saveListing, saveToBlacklist } = require('../saveListing');
const ModelManager = require('../ModelManager');
puppeteer.use(StealthPlugin());

async function ssScraper(url, browser) {
    const page = await browser.newPage();

    await page.goto(url);
    
    const args = {
        url: url,
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
        const blacklistedWords = ['lombards', 'lombardā', 'filiāle', 'filiālē', 'banknote', 'internetveikals', 'internetveikalā', 'Pērkam visus', 'pērkam visus']

        // Price
        let price = document.querySelector('.ads_price');

        if(price) {
            price = price.textContent.replace(/\D/g, '');
            price = parseFloat(price);
        }

        //Memory
        let memory = document.querySelector('#tdo_42');
        if(memory) {
            memory = memory.textContent;
            memory = parseInt(memory);
        }

        // Description
        let description = document.querySelector('#msg_div_msg');
        if(description) {
            description = description.textContent.replace(/[\n+]/g, ' ').trim().toLowerCase();
        }

        const isBlacklisted = blacklistedWords.some(word => description.includes(word.toLowerCase()));

        //Model 
        let model = document.querySelector('#tdo_44');

        if(model) {
            model = model.textContent.trim();
            model = model.replace(/apple /gi, "");
        }

        //Date added 
        let added = document.querySelector('#page_main > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2)');
        if(added) {
            added = added.textContent.trim();
            added = parseDateString(added);
        }

        let element = document.querySelector('#msg_div_msg');

        let tables = element.getElementsByTagName('table');
        while(tables[0]) {
            tables[0].parentNode.removeChild(tables[0]);
        }
        let text = element.innerText;
        text = text.replace(/\n{2,}/g, '\n');

        listingObject.site = 'ss';
        listingObject.url = args.url;
        listingObject.price = price;
        listingObject.model_id = model;
        listingObject.memory = memory;
        listingObject.description = text;
        listingObject.full_title = model;

        listingObject.added = new Date(added.getTime() - added.getTimezoneOffset() * 60000).toISOString();

        if(listingObject.price < 50) {
            listingObject.skip = true;
            listingObject.skipReason = `Price is less than 50 euros / URL: ${args.url}`;
        }

        if(!listingObject.model_id) {
            listingObject.skip = true;
            listingObject.skipReason = `Could not find model / URL: ${args.url}`;
        }

        if(isBlacklisted) {
            listingObject.skip = true;
            listingObject.skipReason = `Contains blacklisted word / URL: ${args.url}`;
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
        }

    } else {
        await saveToBlacklist(listingData);
    }

    await page.close();
}

module.exports = ssScraper;
