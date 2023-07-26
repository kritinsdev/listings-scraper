const { getExistingUrls } = require('./inc/helpers');
const andeleScraper = require('./inc/sites/andeleScraper');
const ssScraper = require('./inc/sites/ssScraper');

const sitesConfig = {
    andelemandele: {
        sitename: 'andelemandele',
        selectors: {
            paginator: '.paginator',
        },
        links: getExistingUrls('andelemandele'),
        scraper: andeleScraper,
    },

    ss: {
        sitename: 'ss',
        links: getExistingUrls('ss'),
        scraper: ssScraper,
    }
};

async function getUrls(site) {
    return await getExistingUrls(site);
}

module.exports = sitesConfig;