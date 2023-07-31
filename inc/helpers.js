const axios = require('axios');
require('dotenv').config()

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomTimeout(min, max) {
    const minDecimal = Math.floor(min * 1000);
    const maxDecimal = Math.floor(max * 1000);
    const randomNumber = Math.floor(Math.random() * (maxDecimal - minDecimal + 1) + minDecimal);
    return randomNumber;
}

const unsortedModels = [
    '7',
    '7+',
    '7 plus',
    '8',
    '8+',
    '8 plus',
    'x',
    'xr',
    'xs',
    'xs max',
    '11',
    '11 pro',
    '11 pro max',
    'se',
    '12',
    '12 mini',
    '12 pro',
    '12 pro max',
    '13',
    '13 mini',
    '13 pro',
    '13 pro max',
    '14',
    '14 plus',
    '14+',
    '14 pro',
    '14 pro max',
    'playstation 3',
    'playstation 4',
    'playstation 5',
];
const models = unsortedModels.sort((a, b) => b.length - a.length);

const modelIds = {
    '6': 1,
    '6 plus': 2,
    '6s': 3,
    '6s plus': 4,
    '7': 5,
    '7 plus': 6,
    '8': 7,
    '8 plus': 8,
    'x': 9,
    'xr': 10,
    'xs': 11,
    'xs max': 12,
    '11': 13,
    '11 pro': 14,
    '11 pro max': 15,
    '12': 16,
    '12 mini': 17,
    '12 pro': 18,
    '12 pro max': 19,
    '13': 20,
    '13 mini': 21,
    '13 pro': 22,
    '13 pro max': 23,
    'se': 24,
    '14': 25,
    '14 plus': 26,
    '14 pro': 27,
    '14 pro max': 28,
};


async function getExistingUrls(site, active = null) {
    const apiUrl = `${process.env.API_URL}/urls`;
    try {
        const params = { 
            site: site,
            active: active
        };

        const response = await axios.get(apiUrl, {
            params: params,
            headers: {
                'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
                'Content-Type': 'application/json',
            }
        });
        return response.data;

    } catch (error) {
        console.error('Error while getting existing URLs:', error);
    }
}

async function getBlacklistUrls(site = null) {
    const apiUrl = `${process.env.API_URL}/blacklist`;
    try {
        const params = { site: site };
        const response = await axios.get(apiUrl, {
            params: params,
            headers: {
                'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error while getting existing URLs:', error);
    }
}

module.exports = {
    sleep,
    getRandomTimeout,
    getExistingUrls,
    getBlacklistUrls,
    models,
    modelIds
}