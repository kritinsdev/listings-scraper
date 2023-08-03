class ModelManager {
    constructor(categories, models) {
        this.modelIds = new Map();
        this.category = categories;

        models.forEach((modelData) => {
            this.addMultipleModels(modelData.category, modelData.models);
        });
    }

    addModel(category, modelName, modelId) {
        if (!this.modelIds.has(category)) {
            console.warn(`Category ${category} does not exist.`);
            return;
        }

        const formattedModelName = modelName.toLowerCase();
        if (!this.modelIds.get(category).has(formattedModelName)) {
            this.modelIds.get(category).set(formattedModelName, modelId);
        }
    }

    addMultipleModels(category, models) {
        if (!this.modelIds.has(category)) {
            this.modelIds.set(category, new Map());
        }

        models.forEach((model) => {
            this.addModel(category, model.name, model.id);
        });
    }

    getModelId(category, modelName) {
        if (!this.modelIds.has(category)) return null;
        const formattedModelName = modelName.toLowerCase();
        return this.modelIds.get(category).get(formattedModelName) || null;
    }

    findModel(string, category) {
        if (!string || !this.modelIds.has(category)) return null;
        const formattedText = this.removeExtraSpaces(string.toLowerCase());
        const models = Array.from(this.modelIds.get(category).keys());
        models.sort((a, b) => b.length - a.length);
        const regex = new RegExp(`\\b(${models.join('|').replace(/\s+/g, '\\s')})\\b`, 'i');
        const regexWithoutSpace = new RegExp(`\\b(${models.join('|').replace(/\s+/g, '')})(?=[a-z0-9]|$)`, 'i');
        let match = formattedText.match(regex);
        if (!match) {
            match = formattedText.match(regexWithoutSpace);
        }
        return match ? match[0] : null;
    }
    
    removeExtraSpaces(string) {
        return string.replace(/\s+/g, ' ').trim();
    }
}

const categories = {
    1: 'Phone',
    2: 'Game Console',
};

const models = [
    {
        category: 1,
        models: [
            { name: 'iPhone 6', id: 1 },
            { name: '6', id: 1 },
            { name: 'iPhone 6+', id: 2 },
            { name: 'iPhone 6 plus', id: 2 },
            { name: '6+', id: 2 },
            { name: '6 plus', id: 2 },
            { name: 'iPhone 6s', id: 3 },
            { name: '6s', id: 3 },
            { name: 'iPhone 6s+', id: 4 },
            { name: 'iPhone 6s plus', id: 4 },
            { name: '6s+', id: 4 },
            { name: '6s plus', id: 4 },
            { name: 'iPhone 7', id: 5 },
            { name: '7', id: 5 },
            { name: 'iPhone 7+', id: 6 },
            { name: 'iPhone 7 plus', id: 6 },
            { name: '7+', id: 6 },
            { name: '7 plus', id: 6 },
            { name: 'iPhone 8', id: 7 },
            { name: '8', id: 7 },
            { name: 'iPhone 8+', id: 8 },
            { name: 'iPhone 8 plus', id: 8 },
            { name: '8+', id: 8 },
            { name: '8 plus', id: 8 },
            { name: 'iPhone X', id: 9 },
            { name: 'x', id: 9 },
            { name: 'iPhone XR', id: 10 },
            { name: 'xr', id: 10 },
            { name: 'iPhone XS', id: 11 },
            { name: 'xs', id: 11 },
            { name: 'iPhone XS Max', id: 12 },
            { name: 'xs max', id: 12 },
            { name: 'iPhone 11', id: 13 },
            { name: '11', id: 13 },
            { name: 'iPhone 11 Pro', id: 14 },
            { name: '11 pro', id: 14 },
            { name: 'iPhone 11 Pro Max', id: 15 },
            { name: '11 pro max', id: 15 },
            { name: 'iPhone 12', id: 16 },
            { name: '12', id: 16 },
            { name: 'iPhone 12 Mini', id: 17 },
            { name: '12 mini', id: 17 },
            { name: '12mini', id: 17 },
            { name: 'iPhone 12 Pro', id: 18 },
            { name: '12 pro', id: 18 },
            { name: 'iPhone 12 Pro Max', id: 19 },
            { name: '12 pro max', id: 19 },
            { name: '12promax', id: 19 },
            { name: 'iPhone 13', id: 20 },
            { name: '13', id: 20 },
            { name: 'iPhone 13 Mini', id: 21 },
            { name: '13 mini', id: 21 },
            { name: 'iPhone 13 Pro', id: 22 },
            { name: '13 pro', id: 22 },
            { name: 'iPhone 13 Pro Max', id: 23 },
            { name: '13 pro max', id: 23 },
            { name: 'iPhone SE', id: 24 },
            { name: 'se', id: 24 },
            { name: 'iPhone 14', id: 25 },
            { name: '14', id: 25 },
            { name: 'iPhone 14 plus', id: 26 },
            { name: 'iPhone 14+', id: 26 },
            { name: '14 plus', id: 26 },
            { name: '14 +', id: 26 },
            { name: 'iPhone 14 Pro', id: 27 },
            { name: '14 pro', id: 27 },
            { name: 'iPhone 14 Pro Max', id: 28 },
            { name: '14 pro max', id: 28 },
        ],
    },
    {
        category: 2,
        models: [
            { name: 'Playstation 3', id: 29 },
            { name: 'Play station 3', id: 29 },
            { name: 'ps 3', id: 29 },
            { name: 'ps3', id: 29 },
            { name: 'Playstation 4', id: 30 },
            { name: 'Playstation 4slim', id: 30 },
            { name: 'Play station 4', id: 30 },
            { name: 'ps 4', id: 30 },
            { name: 'ps4', id: 30 },
            { name: 'Playstation 5', id: 31 },
            { name: 'Play station 5', id: 31 },
            { name: 'ps 5', id: 31 },
            { name: 'ps5', id: 31 },
            { name: 'Nintendo Switch', id: 32 },
            { name: 'Steam Deck', id: 33 },
            { name: 'Xbox 360', id: 34 },
            { name: 'xbox360', id: 34 },
            { name: 'Xbox One', id: 35 },
            { name: 'Xbox series S', id: 36 },
            { name: 'Xbox sērija S', id: 36 },
            { name: 'Xbox series X', id: 37 },
            { name: 'Xbox sērija X', id: 37 },
        ]
    }
];


const MM = new ModelManager(categories, models);

module.exports = MM;
