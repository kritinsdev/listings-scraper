const { modelMap } = require("./modelMap");

class ModelManager {
    constructor(modelData) {
        this.listingTitle = modelData.fullTitle;
        this.memory = (modelData.memory) ? modelData.memory : null;
    }

    findModel() {
        const modelName = this.findModelName(this.listingTitle);
        if (!modelName) {
            return {};
        }

        for (let model of modelMap) {
            if (model.model.toLowerCase() === modelName.toLowerCase() && model.memory === this.memory) {
                const details = {
                    modelId: model.id,
                    targetPrice: model.price,
                    modelName: model.model,
                }

                return details;
            }
        }

        return {};
    }

    findModelName(string) {
        const models = [
            '7',
            '7 plus',
            '7+',
            '8',
            '8 plus',
            '8+',
            'x',
            'xr',
            'xs',
            'xs max',
            '11',
            '11 pro',
            '11 pro max',
            '12',
            '12 mini',
            '12 pro',
            '12 pro max',
            '13',
            '13 mini',
            '13 pro',
            '13 pro max',
            'se 2nd gen',
            'se 3rd gen',
            'se3',
            'se 3',
        ];

        models.sort((a, b) => b.length - a.length);

        const formattedText = string.toLowerCase();
        const regex = new RegExp(
            `(${models.join('|').replace(/\s+/g, '\\s')})(?![0-9])`,
            'gi'
        );
        const match = formattedText.match(regex);
        return match ? `iPhone ${match[0]}` : null;
    }
}

module.exports = ModelManager;
