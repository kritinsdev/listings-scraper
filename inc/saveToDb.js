const axios = require('axios');
require('dotenv').config()

async function saveListing(listingData) {
  const apiUrl = `${process.env.API_URL}/listings`;
  try {
    const response = await axios.post(apiUrl, listingData);
    console.log('SAVED: ', response.data.url);
  } catch (error) {
    console.log('=========== ERROR ===========');
    console.error(error.response.data);
    console.log('=========== ERROR ===========');
  }
}

module.exports = { saveListing };
