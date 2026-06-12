const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../safi.json');
const outputFile = path.join(__dirname, '../src/data/safi.json');

if (!fs.existsSync(inputFile)) {
    console.error(`❌ Input file not found: ${inputFile}`);
    process.exit(1);
}

function transliterateArabic(text) {
    const mapping = {
        'أ': 'a', 'إ': 'a', 'آ': 'a', 'ا': 'a',
        'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j',
        'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh',
        'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
        'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
        'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
        'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
        'ه': 'h', 'و': 'w', 'ي': 'y', 'ة': 'a',
        'ى': 'a', 'ء': '', 'ئ': 'e', 'ؤ': 'o'
    };
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        result += mapping[char] !== undefined ? mapping[char] : char;
    }
    return result;
}

function slugify(text) {
    if (!text) return '';
    const transliterated = transliterateArabic(text);
    return transliterated
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

const rawData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

const CAR_RENTAL_AR = "وكالة تأجير السيارات";
const USED_CAR_AR = "تاجر سيارات مستعملة";

const cleaned = [];
const seenPlaceIds = new Set();
const seenSlugs = new Set();
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

    // 2. Remove duplicates by slug
    if (!item.title) {
        stats.missingCategory++;
        continue;
    }
    const itemSlug = slugify(item.title);
    if (seenSlugs.has(itemSlug)) {
        stats.duplicates++;
        continue;
    }

    // 3. Remove entries with missing phone
    if (!item.phone || item.phone.trim() === '') {
        stats.missingPhone++;
        continue;
    }

    // 4. Remove entries with missing categories
    if (!item.categories || item.categories.length === 0) {
        if (!item.categoryName) {
            stats.missingCategory++;
            continue;
        }
    }

    const catText = [item.categoryName, ...(item.categories || [])].join(' ').toLowerCase();

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
        catText.includes('vente') ||
        catText.includes('used car')
    ) {
        normalizedCategory = USED_CAR_AR;
    } else if (catText.includes('سيارات') || catText.includes('automobile') || catText.includes('voiture')) {
        normalizedCategory = CAR_RENTAL_AR;
    }

    if (!normalizedCategory) {
        stats.uncategorized++;
        continue;
    }

    seenPlaceIds.add(item.placeId);
    seenSlugs.add(itemSlug);

    item.categories = [normalizedCategory];
    item.categoryName = normalizedCategory;
    item.city = "آسفي";

    if (normalizedCategory === CAR_RENTAL_AR) stats.rental++;
    else stats.dealer++;

    cleaned.push(item);
}

fs.writeFileSync(outputFile, JSON.stringify(cleaned, null, 2));

console.log('✅ Safi data cleaned successfully!');
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
