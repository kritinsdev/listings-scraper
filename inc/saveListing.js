const axios = require('axios');
require('dotenv').config()

async function saveListing(listingData) {
  const apiUrl = `${process.env.API_URL}/listings`;
  try {
    const response = await axios.post(apiUrl, listingData, {
      headers: {
        'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.data.url) {
      console.log('SAVED: ', response.data.url);
    }
  } catch (error) {
    console.log('=========== ERROR ===========');
    console.error(error.response.data);
    console.log('=========== ERROR ===========');
  }
}

async function saveToBlacklist(data) {
  const apiUrl = `${process.env.API_URL}/blacklist`;
  try {
    const response = await axios.post(apiUrl, data, {
      headers: {
        'Authorization': `Bearer ${process.env.BEARER_TOKEN}`
      }
    });
    if (response.data.url) {
      console.log(`Saved to BLACKLIST: ${data.skipReason}`);
    }
  } catch (error) {
    console.error(error.response.data);
  }
}

module.exports = { saveListing, saveToBlacklist };
