const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../fes.json');
const outputFile = path.join(__dirname, '../src/data/fes.json');

const rawData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

// Categories to keep and normalize
const CAR_RENTAL_AR = "وكالة تأجير السيارات";
const USED_CAR_AR = "تاجر سيارات مستعملة";

const cleaned = [];
const seenPlaceIds = new Set();

for (const item of rawData) {
    // 1. Remove duplicates
    if (!item.placeId || seenPlaceIds.has(item.placeId)) continue;
    
    // 2. Missing phone
    if (!item.phone || item.phone.trim() === '') continue;
    
    // 3. Missing categories
    if (!item.categories || item.categories.length === 0) {
        if (!item.categoryName) continue;
    }

    // Combine all category text to check intention
    const catText = [item.categoryName, ...(item.categories || [])].join(' ').toLowerCase();

    // 4. Normalize categories
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
        catText.includes('تاجر')
    ) {
        normalizedCategory = USED_CAR_AR;
    }

    if (!normalizedCategory) continue;

    seenPlaceIds.add(item.placeId);
    
    item.categories = [normalizedCategory];
    item.categoryName = normalizedCategory;
    // ensure city is standardized
    item.city = "فاس";

    cleaned.push(item);
}

fs.writeFileSync(outputFile, JSON.stringify(cleaned, null, 2));
console.log(`Successfully cleaned fes data. Original: ${rawData.length}, Cleaned: ${cleaned.length}`);
