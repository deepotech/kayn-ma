const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../tetouan.json');
const outputFile = path.join(__dirname, '../src/data/tetouan.json');

// Check if input file exists
if (!fs.existsSync(inputFile)) {
    console.error(`❌ Input file not found: ${inputFile}`);
    console.log('Please provide a tetouan.json file in the project root.');
    process.exit(1);
}

const rawData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

// Categories to keep and normalize
const CAR_RENTAL_AR = "وكالة تأجير السيارات";
const USED_CAR_AR = "تاجر سيارات مستعملة";

const cleaned = [];
const seenPlaceIds = new Set();
let stats = {
    total: rawData.length,
    duplicates: 0,
    missingPhone: 0,
    missingCategory: 0,
    uncategorized: 0,
    rental: 0,
    dealer: 0,
};

for (const item of rawData) {
    // 1. Remove duplicates by placeId
    if (!item.placeId || seenPlaceIds.has(item.placeId)) {
        stats.duplicates++;
        continue;
    }

    // 2. Remove entries with missing phone
    if (!item.phone || item.phone.trim() === '') {
        stats.missingPhone++;
        continue;
    }

    // 3. Remove entries with missing categories
    if (!item.categories || item.categories.length === 0) {
        if (!item.categoryName) {
            stats.missingCategory++;
            continue;
        }
    }

    // Combine all category text to check intention
    const catText = [item.categoryName, ...(item.categories || [])].join(' ').toLowerCase();

    // 4. Normalize categories into exactly two types
    let normalizedCategory = null;

    if (
        catText.includes('تأجير') ||
        catText.includes('كراء') ||
        catText.includes('location') ||
        catText.includes('rent') ||
        catText.includes('وكالة') ||
        catText.includes('car rental')
    ) {
        normalizedCategory = CAR_RENTAL_AR;
    } else if (
        catText.includes('مستعملة') ||
        catText.includes('بيع') ||
        catText.includes('dealer') ||
        catText.includes('occasion') ||
        catText.includes('تاجر') ||
        catText.includes('vente') ||
        catText.includes('used car')
    ) {
        normalizedCategory = USED_CAR_AR;
    } else if (catText.includes('سيارات') || catText.includes('automobile') || catText.includes('voiture')) {
        // Fallback for generic car-related entries — default to rental
        normalizedCategory = CAR_RENTAL_AR;
    }

    if (!normalizedCategory) {
        stats.uncategorized++;
        continue;
    }

    seenPlaceIds.add(item.placeId);

    // Normalize item
    item.categories = [normalizedCategory];
    item.categoryName = normalizedCategory;
    item.city = "تطوان";

    if (normalizedCategory === CAR_RENTAL_AR) stats.rental++;
    else stats.dealer++;

    cleaned.push(item);
}

fs.writeFileSync(outputFile, JSON.stringify(cleaned, null, 2));

console.log('✅ Tetouan data cleaned successfully!');
console.log('─────────────────────────────────────');
console.log(`📦 Total raw entries:    ${stats.total}`);
console.log(`🔄 Duplicates removed:   ${stats.duplicates}`);
console.log(`📵 Missing phone:        ${stats.missingPhone}`);
console.log(`🏷️  Missing category:     ${stats.missingCategory}`);
console.log(`❓ Uncategorized:        ${stats.uncategorized}`);
console.log('─────────────────────────────────────');
console.log(`✅ Final clean entries:  ${cleaned.length}`);
console.log(`🚗 Car Rental agencies:  ${stats.rental}`);
console.log(`🏪 Used Car dealers:     ${stats.dealer}`);
console.log(`📄 Output: ${outputFile}`);
