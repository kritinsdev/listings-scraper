const { modelMap } = require("./modelMap");

class ModelManager {
    constructor(modelData) {
        this.listingTitle = modelData.full_title;
        this.memory = (modelData.memory) ? modelData.memory : null;
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
            '7 plus',
            '7+',
            '8',
            '8 plus',
            '8+',
            'X',
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
            '14',
            '14 plus',
            '14 pro',
            '14 pro max',
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
