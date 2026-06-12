const fs = require('fs');
const path = require('path');

const rawFile = path.join(__dirname, '../Beni Mellal.json');
const cleanedFile = path.join(__dirname, '../src/data/beni-mellal.json');

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
        if (mapping[char] !== undefined) {
            result += mapping[char];
        } else {
            result += char;
        }
    }
    return result;
}

function slugify(text) {
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

function runValidation() {
    console.log("Starting Beni Mellal Data Validation...");
    
    // Check files existence
    if (!fs.existsSync(rawFile)) {
        console.error("❌ Raw data file does not exist!");
        process.exit(1);
    }
    if (!fs.existsSync(cleanedFile)) {
        console.error("❌ Cleaned data file does not exist! Please run clean script first.");
        process.exit(1);
    }

    const rawData = JSON.parse(fs.readFileSync(rawFile, 'utf8'));
    const cleanedData = JSON.parse(fs.readFileSync(cleanedFile, 'utf8'));

    // 1. Count raw businesses
    const rawCount = rawData.length;

    // 2. Count removed duplicates & invalid records (calculated from clean vs raw)
    const seenPlaceIds = new Set();
    const seenNames = new Set();
    let duplicates = 0;
    let invalid = 0;

    for (const item of rawData) {
        if (!item.title || !item.placeId || (!item.categoryName && (!item.categories || item.categories.length === 0))) {
            invalid++;
            continue;
        }
        if (!item.location || typeof item.location.lat !== 'number' || typeof item.location.lng !== 'number') {
            invalid++;
            continue;
        }
        if (seenPlaceIds.has(item.placeId) || seenNames.has(item.title.toLowerCase().trim())) {
            duplicates++;
            continue;
        }
        seenPlaceIds.add(item.placeId);
        seenNames.add(item.title.toLowerCase().trim());
    }

    // 3. Count categories in cleaned data
    let rentAgenciesCount = 0;
    let usedCarDealersCount = 0;

    const CAR_RENTAL_AR = "وكالة تأجير السيارات";
    const USED_CAR_AR = "تاجر سيارات مستعملة";

    cleanedData.forEach(item => {
        if (item.categoryName === CAR_RENTAL_AR) {
            rentAgenciesCount++;
        } else if (item.categoryName === USED_CAR_AR) {
            usedCarDealersCount++;
        }
    });

    // 4. Verify unique slugs
    const slugs = new Set();
    let duplicateSlugs = 0;
    cleanedData.forEach(item => {
        const slug = `${slugify(item.title)}-beni-mellal`;
        if (slugs.has(slug)) {
            duplicateSlugs++;
            console.error(`❌ Duplicate slug detected: ${slug} for business: ${item.title}`);
        }
        slugs.add(slug);
    });

    // 5. Verify coordinates exist
    let missingCoordsCount = 0;
    cleanedData.forEach(item => {
        if (!item.location || typeof item.location.lat !== 'number' || typeof item.location.lng !== 'number') {
            missingCoordsCount++;
            console.error(`❌ Missing or invalid coordinates for: ${item.title}`);
        }
    });

    // 6. Verify city slug is exactly beni-mellal
    const expectedCitySlug = 'beni-mellal';
    const currentCitySlug = path.basename(cleanedFile, '.json');
    const isCitySlugCorrect = currentCitySlug === expectedCitySlug;

    // 7. Verify all reviews have unique IDs
    let totalReviews = 0;
    const reviewIds = new Set();
    let duplicateReviews = 0;
    cleanedData.forEach(item => {
        if (item.reviews && Array.isArray(item.reviews)) {
            totalReviews += item.reviews.length;
            item.reviews.forEach(rev => {
                if (rev.reviewId) {
                    if (reviewIds.has(rev.reviewId)) {
                        duplicateReviews++;
                    }
                    reviewIds.add(rev.reviewId);
                }
            });
        }
    });

    console.log(`\n==================================================`);
    console.log(`📋 VALIDATION REPORT FOR BENI MELLAL`);
    console.log(`==================================================`);
    console.log(`1. Raw Businesses Count:                ${rawCount}`);
    console.log(`2. Removed Duplicates:                  ${duplicates}`);
    console.log(`3. Removed Invalid Records:             ${invalid}`);
    console.log(`4. Car Rental Agency (وكالة تأجير):      ${rentAgenciesCount}`);
    console.log(`5. Used Car Dealer (تاجر سيارات):        ${usedCarDealersCount}`);
    console.log(`6. Slugs Uniqueness check:              ${duplicateSlugs === 0 ? "PASSED" : `FAILED (${duplicateSlugs} duplicates)`}`);
    console.log(`7. Coordinates Existence check:          ${missingCoordsCount === 0 ? "PASSED" : `FAILED (${missingCoordsCount} missing)`}`);
    console.log(`8. City Slug Verification (${expectedCitySlug}):  ${isCitySlugCorrect ? "PASSED" : "FAILED"}`);
    console.log(`9. Reviews Unique Check (Total: ${totalReviews}): ${duplicateReviews === 0 ? "PASSED" : `FAILED (${duplicateReviews} duplicates)`}`);
    console.log(`==================================================`);

    if (duplicateSlugs === 0 && missingCoordsCount === 0 && isCitySlugCorrect && duplicateReviews === 0) {
        console.log("\n🟢 VALIDATION PASSED. Ready for seeding!");
    } else {
        console.error("\n🔴 VALIDATION FAILED. Please resolve the errors above before seeding.");
        process.exit(1);
    }
}

runValidation();
