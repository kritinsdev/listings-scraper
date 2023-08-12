const { modelMap } = require("./modelMap");

class ModelManager {
    constructor(modelData) {
        this.listingTitle = modelData.full_title;
        this.listingDescription = modelData.description;
        this.memory = modelData.memory;
    }

    findId() {
        for (let entry of modelMap) {
            const modelName = this.findModelName(this.listingTitle) ? this.findModelName(this.listingTitle) : this.findModelName(this.listingDescription);
            if ((entry.model.toLowerCase() === modelName)
                && entry.memory === this.memory
            ){
                return entry.id;
            }
        }
        return null;
    }

    findModelName(title) {
        const models = [
            '7',
            '7 Plus',
            '8',
            '8 Plus',
            'X',
            'XR',
            'XS',
            'XS Max',
            '11',
            '11 Pro',
            '11 Pro Max',
            '12',
            '12 Mini',
            '12 Pro',
            '12 Pro Max',
            '13',
            '13 Mini',
            '13 Pro',
            '13 Pro Max',
            'SE 2nd Gen',
            'SE 3rd Gen',
            'SE3',
            'SE 3',
            '14',
            '14 Plus',
            '14 Pro',
            '14 Pro Max',
        ];
    
        models.sort((a, b) => b.length - a.length);
    
        for (const model of models) {
            if (title.toLowerCase().replace(/\s+/g, '').includes(model.toLowerCase().replace(/\s+/g, ''))) {
                const modelStr = `iPhone ${model}`;
                return modelStr.toLowerCase();
            }
        }
    
        return null;
    }
}

module.exports = ModelManager;
