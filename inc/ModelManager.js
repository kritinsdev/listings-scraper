const { modelMap } = require("./modelMap");

class ModelManager {
    constructor(modelData) {
        this.listingTitle = modelData.full_title;
        this.memory = modelData.memory;
        this.site = modelData.site;
    }

    findId() {
        const modelName = this.findModelName(this.listingTitle);
        if (!modelName) {
            return null;
        }
    
        for (let entry of modelMap) {
            if (entry.model.toLowerCase() === modelName.toLowerCase() && entry.memory === this.memory) {
                return entry.id;
            }
        }
    
        return null;
    }
    
    findModelName(string) {
        const models = [
            '7',
            '7 Plus',
            '7+',
            '8',
            '8 Plus',
            '8+',
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
    
        if(this.site === 'andelemandele') {
            for (const model of models) {
                const patternParts = model.split(' ').map(part => part.replace(/(\d+)/, '\\s*$1\\s*'));
                const patternString = patternParts.join('\\s*');
                const pattern = new RegExp(patternString, 'i');
        
                if (pattern.test(string)) {
                    return `iPhone ${model}`;
                }
            }
        }

        if(this.site === 'ss') {
            const normalizedString = this.normalizeModel(string);

            for (const model of models) {
                const normalizedModel = this.normalizeModel(model);
                if (normalizedModel === normalizedString) {
                  return `iPhone ${model}`;
                }
              }
        }   

        return null;
    }

    normalizeModel(model) {
        return model.toLowerCase().replace(' ', '').replace('+', 'plus');
    }
}

module.exports = ModelManager;
