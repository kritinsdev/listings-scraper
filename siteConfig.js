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
            phone: {
                id:1,
                url:'https://www.andelemandele.lv/perles/elektronika/telefoni/#order:created/brand:3232',
            },
            gameConsole: {
                id:2,
                url:''
            }
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
            phone: {
                id:1,
                url:'https://www.ss.lv/lv/electronics/phones/mobile-phones/apple/sell/',
            },
            gameConsole: {
                id:2,
                url:''
            }
        },
        scrapeOnlyFirst: true,
        scraper: ssScraper,
    }
};

module.exports = {sites, sitesConfig};