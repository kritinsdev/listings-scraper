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
      console.log('================');
      console.log(`SAVED: ${response.data.id} / ${response.data.url}`);
      await createListingDetails({
        id: response.data.id,
        ...listingData
      });
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
    console.log('DETAILS SAVED: ', data.id);
    console.log('================');
  } catch (error) {
    console.error(error.response.data);
  }
}

module.exports = { saveListing, saveToBlacklist };
