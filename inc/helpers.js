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

async function sendToDiscord(listing) {
    const payload = {
      embeds: [
        {
          description: listing.description,
          color: 5814783,
          fields: [
            {
              name: 'Model',
              value: listing.model,
              inline: true
            },
            {
              name: 'Target Price',
              value: `${listing.targetPrice}€`,
              inline: true
            },
            {
              name: 'Actual Price',
              value: `${listing.price}€`,
              inline: true
            },
            {
              name: 'Memory',
              value: listing.memory ? listing.memory : '-',
              inline: false
            },
            {
              name: 'URL',
              value: listing.url,
              inline: false
            },
            {
              name: 'Listing added',
              value: listing.createdAt,
              inline: false
            }
          ],
        }
      ]
    };
  
    try {
      await axios.post(process.env.WEBHOOK, payload);
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  }

module.exports = {
    sleep,
    getRandomTimeout,
    sendToDiscord
}