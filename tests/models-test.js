const ModelManager = require('../inc/inc/ModelManager');

const test = new ModelManager({ fullTitle: 'IPHONE 7plus', memory: null });
const test1 = new ModelManager({ fullTitle: 'iphone 7 plus', memory: null });
const test2 = new ModelManager({ fullTitle: 'IPHONE 7+', memory: null });
const test3 = new ModelManager({ fullTitle: 'IPHONE xs max', memory: null });
const test4 = new ModelManager({ fullTitle: 'iphone 11 pro max', memory: null });
const test5 = new ModelManager({ fullTitle: 'APPLE IPHONE XS MAX 64 GB, GOLD', memory: null });

console.log(test.findModel()); 
console.log(test1.findModel());
console.log(test2.findModel());
console.log(test3.findModel());
console.log(test4.findModel());
console.log(test5.findModel());