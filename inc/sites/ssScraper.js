const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { saveListing, saveToBlacklist } = require('../saveListing');
const MM = require('../ModelManager');
puppeteer.use(StealthPlugin());

async function ssScraper(url, browser, categoryId) {
    const page = await browser.newPage();

    await page.goto(url);
    
    const args = {
        url: url,
        category: categoryId
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
        let model = args.category === 1 ? document.querySelector('#tdo_44') : document.querySelector('#tdo_1649');

        if(model) {
            model = model.textContent.toLowerCase();
            model = model.replace(/apple iphone /gi, "");
        }

        //Date added 
        let added = document.querySelector('#page_main > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2)');
        if(added) {
            added = added.textContent.trim();
            added = parseDateString(added);
        }

        //Views
        let views = document.querySelector('#show_cnt_stat');
        if(views) {
            views = views.textContent.trim();
        }

        //Location
        let location = document.querySelector('#tr_cont > table > tbody > tr:nth-child(4) > td.ads_contacts');
        if(location) {
            location = location.textContent.trim();
        }
        
        let element = document.querySelector('#msg_div_msg');

        let tables = element.getElementsByTagName('table');
        while(tables[0]) {
            tables[0].parentNode.removeChild(tables[0]);
        }
        let text = element.innerText;
        text = text.replace(/\n{2,}/g, '\n');

        listingObject.site = 'ss';
        listingObject.category_id = args.category;
        listingObject.url = args.url;
        listingObject.price = price;
        listingObject.model_id = model;
        listingObject.memory = memory;
        listingObject.description = text;
        listingObject.full_title = null;
        listingObject.views = parseInt(views);
        listingObject.location = location;

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
        const model = findModel(listingData);
        listingData.model_id = model;
        listingData.ssModel = listingData.model_id;

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
    let listingModel = MM.findModel(listingData.model_id, listingData.category_id);
    if (!listingModel) listingModel = MM.findModel(listingData.description, listingData.category_id);
    if (listingModel) {
        model = MM.getModelId(listingData.category_id, listingModel);
    }

    return model;
}

module.exports = ssScraper;
