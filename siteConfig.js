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
        scraper: ssScraper,
    }
};

module.exports = {sites, sitesConfig};