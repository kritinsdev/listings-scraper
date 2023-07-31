const axios = require('axios');
require('dotenv').config()

async function updateListing(data) {
  if (!data.id) return;
  const apiUrl = `${process.env.API_URL}/listings/${data.id}`;
  try {
    const response = await axios.put(apiUrl, data, {
      headers: {
        'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    if(data.info) {
      console.log(`${data.info}`);
    } else {
      console.log(`No update. ID: ${data.id}`);
    }
  } catch (error) {
    console.error(error.response.data);
  }
}

module.exports = { updateListing };
