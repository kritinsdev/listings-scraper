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

async function sendToDiscord(listingData) {
    const payload = {
      embeds: [
        {
          description: listingData.description,
          color: 5814783,
          fields: [
            {
              name: 'Model',
              value: listingData.modelName,
              inline: true
            },
            {
              name: 'Target Price',
              value: `${listingData.targetPrice}€`,
              inline: true
            },
            {
              name: 'Actual Price',
              value: `${listingData.price}€`,
              inline: true
            },
            {
              name: 'Memory',
              value: listingData.memory ? listingData.memory : '-',
              inline: false
            },
            {
              name: 'URL',
              value: listingData.url,
              inline: false
            },
            {
              name: 'Added',
              value: listingData.added,
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