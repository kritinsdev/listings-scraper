const andeleScraper = require('./inc/sites/andeleScraper');
const ssScraper = require('./inc/sites/ssScraper');

const sites = ['andelemandele', 'ss'];

const sitesConfig = {
    andelemandele: {
        sitename: 'andelemandele',
        selectors: {
            paginator: '.paginator',
        },
        url: 'https://www.andelemandele.lv/perles/elektronika/telefoni/#attributes:573/order:created/brand:3232',
        scraper: andeleScraper,
        onlyFirst: true,
    },

    ss: {
        sitename: 'ss',
        selectors: {
            paginator: '.td2',
        },
        url: 'https://www.ss.lv/lv/electronics/phones/mobile-phones/apple/sell/',
        scraper: ssScraper,
        onlyFirst: true,
    },
};

module.exports = {sites, sitesConfig};