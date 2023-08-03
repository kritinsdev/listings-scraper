const andeleScraper = require('./inc/sites/andeleScraper');
const facebookScraper = require('./inc/sites/facebookScraper');
const ssScraper = require('./inc/sites/ssScraper');

const sites = ['andelemandele','ss'];
// const sites = ['facebook'];

const sitesConfig = {
    andelemandele: {
        sitename: 'andelemandele',
        selectors: {
            paginator: '.paginator',
        },
        categories: {
            // phone: {
            //     id:1,
            //     url:'https://www.andelemandele.lv/perles/elektronika/telefoni/#order:created/brand:3232',
            // },
            gameConsole: {
                id:2,
                url:'https://www.andelemandele.lv/perles/elektronika/videospeles/#order:created'
            }
        },
        scrapeOnlyFirst: false,
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
                url:'https://www.ss.lv/lv/electronics/computers/game-consoles/sell/'
            }
        },
        scrapeOnlyFirst: false,
        scraper: ssScraper,
    },

    facebook: {
        sitename: 'facebook',
        selectors: {
            paginator: null,
        },
        categories: {
            phone: {
                id:1,
                url:'https://www.facebook.com/marketplace/106273369404765/iphones',
            },
            },
        scrapeOnlyFirst: true,
        scraper: facebookScraper,
    }
};

module.exports = {sites, sitesConfig};