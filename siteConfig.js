const andeleScraper = require('./inc/sites/andeleScraper');
const ssScraper = require('./inc/sites/ssScraper');

const sites = ['andelemandele'];

const sitesConfig = {
    andelemandele: {
        sitename: 'andelemandele',
        selectors: {
            paginator: '.paginator',
        },
        url: 'https://www.andelemandele.lv/perles/elektronika/telefoni/#attributes:573/order:created/brand:3232',
        scrapeOnlyFirst: false,
        scraper: andeleScraper,
    },

    ss: {
        sitename: 'ss',
        selectors: {
            paginator: '.td2',
        },
        url: 'https://www.ss.lv/lv/electronics/phones/mobile-phones/apple/sell/',
        scrapeOnlyFirst: true,
        scraper: ssScraper,
    },
};

module.exports = {sites, sitesConfig};