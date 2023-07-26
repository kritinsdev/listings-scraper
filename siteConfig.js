const { getExistingUrls } = require('./inc/helpers');
const andeleScraper = require('./inc/sites/andeleScraper');
const ssScraper = require('./inc/sites/ssScraper');

const sites = ['andelemandele', 'ss'];

const sitesConfig = {
    andelemandele: {
        sitename: 'andelemandele',
        selectors: {
            paginator: '.paginator',
        },

        categories: {
            phone: 'https://www.andelemandele.lv/perles/elektronika/telefoni/#order:created/brand:3232',
            gameConsole: ''
        },
        scrapeOnlyFirst: true,
        listingsUrls: getUrls('andelemandele'),
        scraper: andeleScraper,
    },

    ss: {
        sitename: 'ss',
        selectors: {
            paginator: '.td2',
        },

        categories: {
            phone: 'https://www.ss.lv/lv/electronics/phones/mobile-phones/apple/sell/',
            gameConsole: ''
        },
        scrapeOnlyFirst: true,
        listingsUrls: getUrls('ss'),
        scraper: ssScraper,
    }
};

async function getUrls(site) {
    return await getExistingUrls(site);
}

module.exports = {sites, sitesConfig};