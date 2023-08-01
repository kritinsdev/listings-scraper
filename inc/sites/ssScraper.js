const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { saveListing, saveToBlacklist } = require('../saveListing');
const { modelIds } = require('../helpers');
puppeteer.use(StealthPlugin());

async function ssScraper(url, browser) {
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

        const listingObject = {};
        const blacklistedWords = ['lombards', 'lombardā', 'filiāle', 'filiālē', 'banknote', 'internetveikals', 'internetveikalā', 'гарантия', 'Pērkam visus', 'pērkam visus']

        // Price
        let price = document.querySelector('.ads_price').textContent;
        price = price.replace(/\D/g, '');
        price = parseFloat(price);

        //Memory
        let memory = document.querySelector('#tdo_42').textContent;
        memory = parseInt(memory);

        // Description
        let description = document.querySelector('#msg_div_msg').textContent;
        description = description.replace(/[\n+]/g, ' ').trim().toLowerCase();

        const isBlacklisted = blacklistedWords.some(word => description.includes(word.toLowerCase()));

        //Model 
        let model = document.querySelector('#tdo_44').textContent;
        model = model.toLowerCase();
        model = model.replace(/apple iphone /gi, "");

        //Date added 
        let added = document.querySelector('#page_main > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2)').textContent.trim();
        added = parseDateString(added);

        //Views
        let views = document.querySelector('#show_cnt_stat');
        views = views.textContent.trim();

        //Location
        let location = document.querySelector('#tr_cont > table > tbody > tr:nth-child(4) > td.ads_contacts');
        location = location.textContent.trim();
        
        let element = document.querySelector('#msg_div_msg');

        let tables = element.getElementsByTagName('table');
        while(tables[0]) {
            tables[0].parentNode.removeChild(tables[0]);
        }
        let text = element.innerText;
        text = text.replace(/\n{2,}/g, '\n');

        listingObject.site = 'ss';
        listingObject.category_id = 1;
        listingObject.url = url;
        listingObject.price = price;
        listingObject.model_id = modelIds[model];
        listingObject.memory = memory;
        listingObject.description = text;
        listingObject.full_title = null;
        listingObject.views = parseInt(views);
        listingObject.location = location;

        listingObject.added = new Date(added.getTime() - added.getTimezoneOffset() * 60000).toISOString();

        if(listingObject.price < 50) {
            listingObject.skip = true;
            listingObject.skipReason = `Price is less than 50 euros / URL: ${url}`;
        }

        if(!listingObject.model_id) {
            listingObject.skip = true;
            listingObject.skipReason = `Could not find model / URL: ${url}`;
        }

        if(isBlacklisted) {
            listingObject.skip = true;
            listingObject.skipReason = `Contains blacklisted word / URL: ${url}`;
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
        await saveToBlacklist(listingData);
    }
}

module.exports = ssScraper;
