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
    if (response.data.id) {
      console.log(`LISTING_SAVED | LISTING_ID: ${response.data.id} ${listingData.site === 'andelemandele' ? `| TITLE: ${listingData.full_title}` : ''} |  MODEL: ${response.data.model} | URL: ${listingData.url}`);
    }
  } catch (error) {
    console.error(error.response.data);
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

async function createListingDetails(data) {
  const apiUrl = `${process.env.API_URL}/details`;
  try {
    const response = await axios.post(apiUrl, {listing_id : data.id, ...data}, {
      headers: {
        'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error(error.response.data);
  }
}

module.exports = { saveListing, saveToBlacklist };
