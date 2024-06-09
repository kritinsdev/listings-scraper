const axios = require('axios');
require('dotenv').config();

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

module.exports = { sendToDiscord };
