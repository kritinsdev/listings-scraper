const andeleScraper = require('./inc/sites/andeleScraper');
const ssScraper = require('./inc/sites/ssScraper');
const facebookScraper = require('./inc/sites/facebookScraper');

const sites = ['andelemandele'];
// const sites = ['ss'];
// const sites = ['facebook'];

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
        scrapeOnlyFirst: false,
        scraper: ssScraper,
    },

    facebook: {
        sitename: 'facebook',
        selectors: {
            paginator: null,
        },
        url:'https://www.facebook.com/marketplace/106273369404765/iphones',
        scrapeOnlyFirst: true,
        scraper: facebookScraper,
    }
};

module.exports = {sites, sitesConfig};