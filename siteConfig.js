const { getExistingUrls } = require('./inc/helpers');
const andeleScraper = require('./inc/sites/andeleScraper');
const ssScraper = require('./inc/sites/ssScraper');

export const sites = ['andelemandele', 'ss'];

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
        existingLinks: getExistingUrls('andelemandele'),
        scraper: andeleScraper,
    },

    ss: {
        sitename: 'ss',
        existingLinks: getExistingUrls('ss'),
        scraper: ssScraper,
    }
};

async function getUrls(site) {
    return await getExistingUrls(site);
}

module.exports = sitesConfig;