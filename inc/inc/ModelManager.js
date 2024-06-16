const { modelMap, modelLookup } = require("./modelMap");

class ModelManager {
    constructor(modelData) {
        this.listingTitle = modelData.fullTitle ? modelData.fullTitle.toLowerCase() : null;

        if (this.listingTitle) {
            this.listingTitle = this.listingTitle.replace(/[^\w\s]/gi, '');
        }

        this.memory = modelData.memory ? modelData.memory : null;
    }

    findModel() {
        const modelName = this.findModelName(this.listingTitle);

        if (!modelName) {
            return {};
        }

        const model = modelMap.find(m => m.model.includes(modelName) && (this.memory === null || m.memory === this.memory));

        return model || {};
    }

    findModelName(string) {
        if (!string) {
            return null;
        }

        const words = string.split(/\s+/);

        let matchedModel = null;
        for (let i = 0; i < words.length; i++) {
            for (let j = i + 1; j <= words.length; j++) {
                const modelCandidate = words.slice(i, j).join(' ');
                if (modelLookup[modelCandidate]) {
                    matchedModel = modelCandidate;
                }
            }
        }

        return matchedModel;
    }

    setDefaultMemory(model) {
        const defaultMemories = {
            '7': 32,
            '7plus': 32,
            '7+': 32,
            '8': 64,
            '8plus': 64,
            '8+': 64,
            'x': 64,
            'xr': 64,
            'xsmax': 64,
            'xs': 64,
            '11': 64,
            '11pro': 64,
            '11promax': 64,
            '12': 64,
            '12mini': 64,
            '12pro': 128,
            '12promax': 128,
            '13': 128,
            '13mini': 128,
            '13pro': 128,
            '13promax': 128,
            'se2ndgen': 64,
            'se2': 64,
            'se3rdgen': 64,
            'se3': 64,
            '14': 128,
            '14plus': 128,
            '14pro': 128,
            '14promax': 128,
            '15': 128,
            '15plus': 128,
            '15pro': 128,
            '15promax': 128,
        };

        return defaultMemories[model] || null;
    }
}

module.exports = ModelManager;
