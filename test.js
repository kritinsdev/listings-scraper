const ModelManager = require("./inc/ModelManager");

const listing = {
    site: 'ss',
    full_title : 'Apple iPhone 13 pro max',
}
const MM = new ModelManager(listing);

console.log(MM.findId()); 

// function findModelName(string) {
//     const models = [
//         '7',
//         '7 Plus',
//         '8',
//         '8 Plus',
//         'X',
//         'XR',
//         'XS',
//         'XS Max',
//         '11',
//         '11 Pro',
//         '11 Pro Max',
//         '12',
//         '12 Mini',
//         '12 Pro',
//         '12 Pro Max',
//         '13',
//         '13 Mini',
//         '13 Pro',
//         '13 Pro Max',
//         'SE 2nd Gen',
//         'SE 3rd Gen',
//         'SE3',
//         'SE 3',
//         '14',
//         '14 Plus',
//         '14 Pro',
//         '14 Pro Max',
//     ];

//     models.sort((a, b) => b.length - a.length);

//     for (const model of models) {
//         const patternParts = model.split(' ').map(part => part.replace(/(\d+)/, '\\s*$1\\s*'));
//         const patternString = patternParts.join('\\s*');
//         const pattern = new RegExp(patternString, 'i');

//         if (pattern.test(string)) {
//             return `iPhone ${model}`;
//         }
//     }

//     return null;
// }

// console.log(findModelName(listing.full_title));