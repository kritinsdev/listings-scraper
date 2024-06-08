const andeleScraper = require('./inc/sites/andeleScraper');
const ssScraper = require('./inc/sites/ssScraper');

const sites = ['andelemandele', 'ss'];

const sitesConfig = {
    andelemandele: {
        sitename: 'andelemandele',
        selectors: {
            paginator: '.paginator',
        },
        url: 'https://www.andelemandele.lv/perles/elektronika/telefoni/#order:created/brand:3232',
        scrapeOnlyFirst: true,
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