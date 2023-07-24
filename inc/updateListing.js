const axios = require('axios');
require('dotenv').config()

async function updateListing(data) {
  if (!data.id) return;
  const apiUrl = `${process.env.API_URL}/listings/${data.id}`;
  try {
    const response = await axios.put(apiUrl, data);

    console.log(`Listing ID ${response.data.id} updated`);
  } catch (error) {
    console.log('=========== ERROR ===========');
    console.error(error.response.data);
    console.log('=========== ERROR ===========');
  }
}

module.exports = { updateListing };
