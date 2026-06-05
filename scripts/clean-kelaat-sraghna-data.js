const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../El Kelâa des Sraghna.json');
const outputFile = path.join(__dirname, '../src/data/kelaat-sraghna.json');

const rawData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

// Standard Category translations in DB mapping
const CAR_RENTAL_AR = "وكالة تأجير السيارات";
const USED_CAR_AR = "تاجر سيارات مستعملة";

const cleaned = [];
const seenPlaceIds = new Set();
const seenNames = new Set();

let missingCategoryCount = 0;
let missingNameCount = 0;
let missingPlaceIdCount = 0;
let duplicatePlaceIdCount = 0;
let duplicateNameCount = 0;
let unrecognizedCategoryCount = 0;

for (const item of rawData) {
    // 1. Missing Name
    if (!item.title || item.title.trim() === '') {
        missingNameCount++;
        continue;
    }

    // 2. Missing Place ID
    if (!item.placeId || item.placeId.trim() === '') {
        missingPlaceIdCount++;
        continue;
    }

    // 3. Duplicate Place ID
    if (seenPlaceIds.has(item.placeId)) {
        duplicatePlaceIdCount++;
        continue;
    }

    // 4. Duplicate Name
    const normalizedName = item.title.toLowerCase().trim();
    if (seenNames.has(normalizedName)) {
        duplicateNameCount++;
        continue;
    }

    // 5. Missing Category
    if (!item.categoryName && (!item.categories || item.categories.length === 0)) {
        missingCategoryCount++;
        continue;
    }

    // Combine category texts to check classification
    const rawCategories = item.categories || [];
    const primaryCategory = item.categoryName || rawCategories[0] || '';
    const catText = [primaryCategory, ...rawCategories].join(' ').toLowerCase();

    let normalizedCategory = null;

    if (
        catText.includes('تأجير') || 
        catText.includes('كراء') || 
        catText.includes('location') || 
        catText.includes('rent') ||
        catText.includes('وكالة')
    ) {
        normalizedCategory = CAR_RENTAL_AR;
    } else if (
        catText.includes('مستعملة') || 
        catText.includes('بيع') || 
        catText.includes('dealer') || 
        catText.includes('occasion') ||
        catText.includes('تاجر') ||
        catText.includes('معرض') ||
        catText.includes('concessionnaire')
    ) {
        normalizedCategory = USED_CAR_AR;
    }

    // 6. Unrecognized Category
    if (!normalizedCategory) {
        unrecognizedCategoryCount++;
        continue;
    }

    seenPlaceIds.add(item.placeId);
    seenNames.add(normalizedName);

    // Keep originalCategory
    item.originalCategory = primaryCategory;
    
    // Normalize properties
    item.categories = [normalizedCategory];
    item.categoryName = normalizedCategory;
    item.city = "قلعة السراغنة"; // Standardized Arabic City Name

    cleaned.push(item);
}

fs.writeFileSync(outputFile, JSON.stringify(cleaned, null, 2));

console.log(`=========================================`);
console.log(`📊 CLEANING STATISTICS FOR KELAAT SRAGHNA`);
console.log(`=========================================`);
console.log(`Raw Records:                ${rawData.length}`);
console.log(`Cleaned Records Saved:      ${cleaned.length}`);
console.log(`-----------------------------------------`);
console.log(`Skipped due to:`);
console.log(` - Missing Name:            ${missingNameCount}`);
console.log(` - Missing PlaceID:         ${missingPlaceIdCount}`);
console.log(` - Duplicate PlaceID:       ${duplicatePlaceIdCount}`);
console.log(` - Duplicate Name:          ${duplicateNameCount}`);
console.log(` - Missing Category:        ${missingCategoryCount}`);
console.log(` - Unrecognized Category:   ${unrecognizedCategoryCount}`);
console.log(`=========================================`);
