const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/data/kelaat-sraghna.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

console.log("Kelaat Sraghna Businesses:");
data.forEach((item, index) => {
    console.log(`${index + 1}. ${item.title} (${item.categoryName})`);
});
