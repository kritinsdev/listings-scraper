class ModelManager {
    constructor(models) {
        this.modelIds = new Map();

        models.forEach((modelData) => {
            this.addMultipleModels(modelData.models);
        });
    }

    addModel(modelName, modelId) {
        const formattedModelName = modelName.toLowerCase();
        if (!this.modelIds.has(formattedModelName)) {
            this.modelIds.set(formattedModelName, modelId);
        }
    }

    addMultipleModels(models) {
        models.forEach((model) => {
            this.addModel(model.name, model.id);
        });
    }

    getModelId(modelName) {
        const formattedModelName = modelName.toLowerCase();
        return this.modelIds.get(formattedModelName) || null;
    }

    findModel(string) {
        if (!string) return null;
        const formattedText = this.removeExtraSpaces(string.toLowerCase());
        const models = Array.from(this.modelIds.keys());
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

const models = [
    {
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
];

const MM = new ModelManager(models);

module.exports = MM;
