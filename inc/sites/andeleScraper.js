const ModelManager = require('../inc/ModelManager');
const { sendToDiscord } = require('../helpers');


async function andeleScraper(url, browser, db) {
    const page = await browser.newPage();

    await page.goto(url, {timeout: 0});

    const args = {
        url: url,
        site: 'andelemandele',
    }

    const listing = await page.evaluate((args) => {
        const listingObject = {};
        listingObject.url = args.url;
        listingObject.site = args.site;

        const unavailable = document.querySelector('.block-404');
        if (unavailable) {
            listingObject.skip = true;
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
        
            if (dateString.startsWith('šodien')) {
                const time = dateString.split(',')[1].trim().split(':');
                const date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), +time[0], +time[1]);
                return date;
            }
        
            if (dateString.startsWith('vakar')) {
                const time = dateString.split(',')[1].trim().split(':');
                const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, +time[0], +time[1]);
                return date;
            }
        
            const parts = dateString.split(', ');
            if (parts.length !== 2) {
                throw new Error(`Invalid date string format: ${dateString}`);
            }
        
            const dateParts = parts[0].split('. ');
            if (dateParts.length !== 2) {
                throw new Error(`Invalid date string format: ${dateString}`);
            }
        
            const day = parseInt(dateParts[0], 10);
            const month = monthNames[dateParts[1].toLowerCase()];
            const timeParts = parts[1].split(':');
            if (timeParts.length !== 2) {
                throw new Error(`Invalid time string format: ${parts[1]}`);
            }
            
            const hour = parseInt(timeParts[0], 10);
            const minute = parseInt(timeParts[1], 10);
        
            if (isNaN(month) || month < 0 || month > 11) {
                throw new Error(`Invalid month: ${dateParts[1]}`);
            }
        
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

        const price = document.querySelector('.product-node__price');
        const oldPrice = price.querySelector('s');
        if (oldPrice) {
            oldPrice.remove();
        }
        const formattedPrice = price.textContent.replace(/[^0-9.]+/g, '');

        const description = (document.querySelector('.product-node__descr')) ? document.querySelector('.product-node__descr').textContent.trim() : null;
        const formattedDescription = (description) ? description.replace(/[\n+]/g, ' ') : null;

        let title = document.querySelector('.product-node__title');
        const spanElements = title.querySelectorAll('span');
        spanElements.forEach(spanElement => {
            spanElement.remove();
        });
        title = title.textContent.replace(/\t|\n/g, '');

        listingObject.fullTitle = title;
        listingObject.description = formattedDescription;
        listingObject.memory = findMemory(title) ? findMemory(title) : findMemory(formattedDescription);
        listingObject.price = parseFloat(formattedPrice);

        const dataRows = document.querySelectorAll('.product-attribute-list > tbody > tr');
        for (let i = 0; i < dataRows.length; i++) {
            const propName = dataRows[i].querySelector('.product-attribute-list__key').textContent.toLowerCase().trim();
            const propValue = dataRows[i].querySelector('.product-attribute-list__value');

            if (propName) {
                if (propName == 'pievienots') {
                    const span = propValue.querySelector('span')
                    if(span) {
                        span.remove();
                    }

                    date = propValue.textContent;

                    let parsedDate = parseDate(date.toLowerCase());
                    listingObject.createdAt = parsedDate.toLocaleString('en-GB', { timeZone: 'Europe/Riga' });
                }
            }
        }

        if (listingObject.price < 50) {
            listingObject.skip = true;
            return listingObject;
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

            if((Math.abs(listing.price - modelData.price) <= 30)) {
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

module.exports = andeleScraper;
