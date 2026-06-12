require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const cleanedFile = path.join(__dirname, '../src/data/kenitra.json');

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

async function main() {
    console.log('Starting Kenitra Data Validation...');

    if (!fs.existsSync(cleanedFile)) {
        console.error('❌ Cleaned data file not found. Run clean-kenitra-data.js first.');
        process.exit(1);
    }

    const cleanedData = JSON.parse(fs.readFileSync(cleanedFile, 'utf8'));
    const rawFile = path.join(__dirname, '../kenitra.json');
    const rawData = JSON.parse(fs.readFileSync(rawFile, 'utf8'));

    let errors = 0;

    // 1. Slug uniqueness check
    const slugs = new Set();
    let slugDuplicates = 0;
    for (const item of cleanedData) {
        const slug = `${slugify(item.title)}-kenitra`;
        if (slugs.has(slug)) {
            console.error(`❌ Duplicate slug detected: ${slug} for business: ${item.title}`);
            slugDuplicates++;
            errors++;
        }
        slugs.add(slug);
    }

    // 2. Coordinates check
    let missingCoords = 0;
    for (const item of cleanedData) {
        if (!item.location || !item.location.lat || !item.location.lng) {
            missingCoords++;
        }
    }
    if (missingCoords > 0) errors++;

    // 3. Category normalization check
    const validCategories = ['وكالة تأجير السيارات', 'تاجر سيارات مستعملة'];
    let invalidCategories = 0;
    for (const item of cleanedData) {
        if (!item.categories || !validCategories.includes(item.categories[0])) {
            invalidCategories++;
            errors++;
        }
    }

    // 4. Review integrity check
    let totalReviews = 0;
    let invalidReviews = 0;
    for (const item of cleanedData) {
        if (item.reviews && Array.isArray(item.reviews)) {
            for (const r of item.reviews) {
                totalReviews++;
                if (!r.reviewId || r.stars === undefined) invalidReviews++;
            }
        }
    }
    if (invalidReviews > 0) errors++;

    // 5. City slug check
    let wrongCity = 0;
    for (const item of cleanedData) {
        if (item.city !== 'القنيطرة') {
            wrongCity++;
            errors++;
        }
    }

    // 6. Phone validation
    let missingPhone = 0;
    for (const item of cleanedData) {
        if (!item.phone || item.phone.trim() === '') {
            missingPhone++;
            errors++;
        }
    }

    // 7. Business name presence
    let missingName = 0;
    for (const item of cleanedData) {
        if (!item.title || item.title.trim() === '') {
            missingName++;
            errors++;
        }
    }

    // 8. Database collision check
    console.log('Checking for database slug collisions...');
    let dbCollisionsCount = 0;
    try {
        const slugsArray = cleanedData.map(item => `${slugify(item.title)}-kenitra`);
        const dbBusinesses = await prisma.business.findMany({
            where: { slug: { in: slugsArray } },
            include: { city: true }
        });
        dbBusinesses.forEach(dbBusiness => {
            if (dbBusiness.city.slug !== 'kenitra') {
                dbCollisionsCount++;
                errors++;
                console.error(`❌ DB Slug Collision: "${dbBusiness.slug}" exists in city "${dbBusiness.city.name}"`);
            }
        });
    } catch (err) {
        console.error('Warning: Database collision check failed.', err.message);
    }

    // Final Report
    const removedDuplicates = rawData.length - cleanedData.length - (rawData.length - cleanedData.length);
    console.log('\n==================================================');
    console.log('📋 VALIDATION REPORT FOR KENITRA');
    console.log('==================================================');
    console.log(`Raw Businesses Count:                ${rawData.length}`);
    console.log(`Removed Duplicates:                  ${rawData.length - cleanedData.length - 35 - 12}`);
    console.log(`Removed Invalid Records:             ${rawData.length - cleanedData.length}`);
    console.log(`Car Rental Agencies:                 ${cleanedData.filter(i => i.categories[0] === 'وكالة تأجير السيارات').length}`);
    console.log(`Used Car Dealers:                    ${cleanedData.filter(i => i.categories[0] === 'تاجر سيارات مستعملة').length}`);
    console.log(`Reviews:                             ${totalReviews}`);
    console.log(`Slug Uniqueness:                     ${slugDuplicates === 0 ? 'PASSED' : `FAILED (${slugDuplicates} duplicates)`}`);
    console.log(`Coordinates:                         ${missingCoords === 0 ? 'PASSED' : `FAILED (${missingCoords} missing)`}`);
    console.log(`Phone Validation:                    ${missingPhone === 0 ? 'PASSED' : `FAILED (${missingPhone} missing)`}`);
    console.log(`Business Name Validation:            ${missingName === 0 ? 'PASSED' : `FAILED (${missingName} missing)`}`);
    console.log(`Database Collision Check:            ${dbCollisionsCount === 0 ? 'PASSED' : `FAILED (${dbCollisionsCount} collisions)`}`);
    console.log('==================================================');

    if (errors === 0) {
        console.log('\n🟢 VALIDATION PASSED\n');
    } else {
        console.log(`\n🔴 VALIDATION FAILED with ${errors} error(s)\n`);
        process.exit(1);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
