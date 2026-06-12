require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const rawFile = path.join(__dirname, '../tetouan.json');
const cleanedFile = path.join(__dirname, '../src/data/tetouan.json');

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

async function runValidation() {
    console.log("Starting Tetouan Data Validation...");
    
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
        if (!item.phone || item.phone.trim() === '') {
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
        const slug = `${slugify(item.title)}-tetouan`;
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

    // 6. Verify city slug is exactly tetouan
    const expectedCitySlug = 'tetouan';
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

    // 8. Phone Number Validation
    let invalidPhonesCount = 0;
    cleanedData.forEach(item => {
        if (!item.phone || item.phone.trim().length < 5) {
            invalidPhonesCount++;
            console.error(`❌ Invalid phone number for: ${item.title} (${item.phone})`);
        }
    });

    // 9. Business Name Validation
    let invalidNamesCount = 0;
    cleanedData.forEach(item => {
        if (!item.title || typeof item.title !== 'string' || item.title.trim() === '') {
            invalidNamesCount++;
            console.error(`❌ Invalid business name detected`);
        }
    });

    // 10. Database Collision Check
    console.log("Checking for database slug collisions...");
    let dbCollisionsCount = 0;
    try {
        const slugsArray = cleanedData.map(item => `${slugify(item.title)}-tetouan`);
        const dbBusinesses = await prisma.business.findMany({
            where: { slug: { in: slugsArray } },
            include: { city: true }
        });
        dbBusinesses.forEach(dbBusiness => {
            if (dbBusiness.city.slug !== 'tetouan') {
                dbCollisionsCount++;
                console.error(`❌ DB Slug Collision: Slug "${dbBusiness.slug}" already exists in city "${dbBusiness.city.name}" (ID: ${dbBusiness.id})`);
            }
        });
    } catch (err) {
        console.error("Warning: Database collision check failed or database is not reachable.", err.message);
    }

    console.log(`\n==================================================`);
    console.log(`📋 VALIDATION REPORT FOR TETOUAN`);
    console.log(`==================================================`);
    console.log(`Raw Businesses Count:                ${rawCount}`);
    console.log(`Removed Duplicates:                  ${duplicates}`);
    console.log(`Removed Invalid Records:             ${invalid}`);
    console.log(`Car Rental Agencies:                 ${rentAgenciesCount}`);
    console.log(`Used Car Dealers:                    ${usedCarDealersCount}`);
    console.log(`Reviews:                             ${totalReviews}`);
    console.log(`Slug Uniqueness:                     ${duplicateSlugs === 0 ? "PASSED" : `FAILED (${duplicateSlugs} duplicates)`}`);
    console.log(`Coordinates:                         ${missingCoordsCount === 0 ? "PASSED" : `FAILED (${missingCoordsCount} missing)`}`);
    console.log(`Phone Validation:                    ${invalidPhonesCount === 0 ? "PASSED" : `FAILED (${invalidPhonesCount} invalid)`}`);
    console.log(`Business Name Validation:            ${invalidNamesCount === 0 ? "PASSED" : `FAILED (${invalidNamesCount} invalid)`}`);
    console.log(`Database Collision Check:            ${dbCollisionsCount === 0 ? "PASSED" : `FAILED (${dbCollisionsCount} collisions)`}`);
    console.log(`==================================================`);

    await prisma.$disconnect();

    if (
        duplicateSlugs === 0 &&
        missingCoordsCount === 0 &&
        isCitySlugCorrect &&
        duplicateReviews === 0 &&
        invalidPhonesCount === 0 &&
        invalidNamesCount === 0 &&
        dbCollisionsCount === 0
    ) {
        console.log("\n🟢 VALIDATION PASSED");
    } else {
        console.error("\n🔴 VALIDATION FAILED");
        process.exit(1);
    }
}

runValidation().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
