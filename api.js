require('dotenv').config();
const express = require('express');
const path = require('path');
const Database = require('./inc/models/Database');
const {modelMap} = require('./inc/inc/modelMap');

const app = express();
const PORT = process.env.PORT || 4000;

const db = new Database(process.env.MONGO_URI);

app.use(express.json());

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

(async () => {
    await db.connect();
})();

app.get('/api/listings', async (req, res) => {
    try {
        const site = req.query.site;
        const modelId = req.query.modelId;
        const sortPrice = req.query.sortPrice;

        const listings = await db.fetchListings(site, modelId, sortPrice);
        res.render('index', { listings, modelMap });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

process.on('SIGINT', async () => {
    await db.close();
    process.exit(0);
});
