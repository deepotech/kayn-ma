const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../agadir.json');
const outputFile = path.join(__dirname, '../src/data/agadir.json');

const rawData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

// Normalized Arabic category labels
const CAR_RENTAL_AR = "وكالة تأجير السيارات";
const USED_CAR_AR = "تاجر سيارات مستعملة";

const cleaned = [];
const seenPlaceIds = new Set();

for (const item of rawData) {
    // 1. Remove duplicates by placeId
    if (!item.placeId || seenPlaceIds.has(item.placeId)) continue;

    // 2. Remove entries with missing phone
    if (!item.phone || item.phone.trim() === '') continue;

    // 3. Remove entries with missing categories
    if (!item.categories || item.categories.length === 0) {
        if (!item.categoryName) continue;
    }

    // Combine all category text to detect intent
    const catText = [item.categoryName, ...(item.categories || [])].join(' ').toLowerCase();

    // 4. Normalize categories
    let normalizedCategory = null;

    // ----- Car Rental -----
    if (
        catText.includes('تأجير') ||
        catText.includes('كراء') ||
        catText.includes('location') ||
        catText.includes('rent') ||
        catText.includes('وكالة') ||
        catText.includes('car rental') ||
        catText.includes('موقع إرجاع السيارة')
    ) {
        if (
            catText.includes('تأجير السيارات') ||
            catText.includes('كراء السيارات') ||
            catText.includes('car rental') ||
            catText.includes('location de voiture') ||
            catText.includes('rent a car') ||
            catText.includes('موقع إرجاع السيارة')
        ) {
            normalizedCategory = CAR_RENTAL_AR;
        } else if (
            catText.includes('وكالة تأجير') ||
            catText.includes('خدمة تأجير السيارات')
        ) {
            normalizedCategory = CAR_RENTAL_AR;
        }
    }

    // ----- Used Car Dealer -----
    if (!normalizedCategory) {
        if (
            catText.includes('مستعملة') ||
            catText.includes('occasion') ||
            catText.includes('used car') ||
            catText.includes('dealer') ||
            catText.includes('تاجر سيارات مستعملة')
        ) {
            normalizedCategory = USED_CAR_AR;
        }
    }

    // ----- Generic "car dealer" fallback -> Used Car Dealer -----
    if (!normalizedCategory) {
        if (
            catText.includes('تاجر سيارات') ||
            catText.includes('تاجر السيارات') ||
            catText.includes('car dealer') ||
            catText.includes('concessionnaire') ||
            catText.includes('موزع')
        ) {
            normalizedCategory = USED_CAR_AR;
        }
    }

    // Skip if we can't map to one of the two supported categories
    if (!normalizedCategory) continue;

    // Skip non-car-rental businesses (motorcycles, bikes, scooters, quads…)
    const nonCarPatterns = [
        'دراجة', 'دراجات', 'بخارية', 'نارية', 'سكوتر', 'quad', 'atv',
        'jet ski', 'boat', 'قارب', 'تزلج', 'غوص', 'شاحنة', 'حافلة',
        'سياحية', 'سفر', 'فندق', 'شقق', 'مطار', 'تاكسي', 'وقوف',
        'غسيل', 'صيانة', 'ميكانيك', 'إلكتروني', 'هاتف', 'كمبيوتر',
        'مزاد', 'ركوب الخيل', 'صيد', 'تسوق', 'ترفيه'
    ];
    const isNonCar = nonCarPatterns.some(p => catText.includes(p));
    if (isNonCar) continue;

    seenPlaceIds.add(item.placeId);

    // Normalize the category fields to use the canonical Arabic label
    item.categories = [normalizedCategory];
    item.categoryName = normalizedCategory;

    // Standardize city field
    item.city = "أكادير";

    cleaned.push(item);
}

// Ensure output directory exists
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputFile, JSON.stringify(cleaned, null, 2));
console.log(`✅ Agadir data cleaned.`);
console.log(`   Original records : ${rawData.length}`);
console.log(`   Cleaned records  : ${cleaned.length}`);
console.log(`   Rental agencies  : ${cleaned.filter(r => r.categoryName === CAR_RENTAL_AR).length}`);
console.log(`   Used-car dealers : ${cleaned.filter(r => r.categoryName === USED_CAR_AR).length}`);
console.log(`   Output file      : ${outputFile}`);
