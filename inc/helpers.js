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
}