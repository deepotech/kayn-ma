require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const cleanedFile = path.join(__dirname, '../src/data/beni-mellal.json');

const CATEGORY_MAP = {
    'وكالة تأجير السيارات': 'Car Rental Agency',
    'تاجر سيارات مستعملة': 'Used Car Dealer'
};

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

function calculateRating(reviews) {
    if (!reviews || reviews.length === 0) return null;
    const validReviews = reviews.filter(r => r.stars && typeof r.stars === 'number');
    if (validReviews.length === 0) return null;
    const sum = validReviews.reduce((acc, r) => acc + r.stars, 0);
    return Math.round((sum / validReviews.length) * 10) / 10;
}

async function main() {
    console.log("🚀 Starting database seeding for Beni Mellal...");

    if (!fs.existsSync(cleanedFile)) {
        console.error("❌ Cleaned data file not found!");
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(cleanedFile, 'utf8'));
    console.log(`Loaded ${data.length} businesses for seeding.`);

    // 1. Upsert City
    const citySlug = 'beni-mellal';
    console.log(`Upserting City: ${citySlug}`);
    const city = await prisma.city.upsert({
        where: { slug: citySlug },
        update: {
            name: 'Beni Mellal',
            lat: 32.3373,
            lng: -6.3498
        },
        create: {
            name: 'Beni Mellal',
            slug: citySlug,
            lat: 32.3373,
            lng: -6.3498
        }
    });
    console.log(`✅ City upserted (ID: ${city.id})`);

    // 2. Ensure Categories exist
    const categoryRecords = {};
    for (const [arCat, enCat] of Object.entries(CATEGORY_MAP)) {
        const catSlug = enCat.toLowerCase().replace(/\s+/g, '-');
        const cat = await prisma.category.upsert({
            where: { name: enCat },
            update: { slug: catSlug },
            create: { name: enCat, slug: catSlug }
        });
        categoryRecords[arCat] = cat.id;
    }
    console.log("✅ Categories ensured in database");

    // 3. Upsert Businesses and their Reviews
    let businessUpsertsCount = 0;
    let reviewsUpsertsCount = 0;

    for (const item of data) {
        const businessSlug = `${slugify(item.title)}-beni-mellal`;
        const rating = calculateRating(item.reviews || []);
        const reviewsCount = item.reviews?.length || 0;
        const photos = item.imageUrls || (item.imageUrl ? [item.imageUrl] : []);

        const phone = item.phone ? item.phone.replace(/\s+/g, ' ').trim() : null;

        // Determine if it offers mixed services
        let isMixed = false;
        if (item.originalCategory && (
            item.originalCategory.includes('Café') ||
            item.originalCategory.includes('Hotel') ||
            (item.originalCategory.includes('Agency') === false && item.originalCategory.includes('Rent') === false && item.originalCategory.includes('Car') === false)
        )) {
            isMixed = true;
        }

        console.log(`Upserting Business: ${item.title} (${businessSlug})`);
        const business = await prisma.business.upsert({
            where: { slug: businessSlug },
            update: {
                name: item.title.trim(),
                address: item.address || '',
                phone: phone,
                website: item.website || null,
                lat: item.location?.lat || null,
                lng: item.location?.lng || null,
                rating: rating,
                reviewsCount: reviewsCount,
                photos: photos,
                cityId: city.id,
                mixedServices: isMixed
            },
            create: {
                slug: businessSlug,
                name: item.title.trim(),
                address: item.address || '',
                phone: phone,
                website: item.website || null,
                lat: item.location?.lat || null,
                lng: item.location?.lng || null,
                rating: rating,
                reviewsCount: reviewsCount,
                photos: photos,
                cityId: city.id,
                source: 'apify',
                status: 'active',
                mixedServices: isMixed
            }
        });
        businessUpsertsCount++;

        // Link category
        const catId = categoryRecords[item.categoryName];
        if (catId) {
            await prisma.businessCategory.upsert({
                where: {
                    businessId_categoryId: {
                        businessId: business.id,
                        categoryId: catId
                    }
                },
                update: {},
                create: {
                    businessId: business.id,
                    categoryId: catId
                }
            });
        }

        // Seeding Reviews
        if (item.reviews && Array.isArray(item.reviews)) {
            for (const r of item.reviews) {
                if (!r.reviewId) continue;
                
                await prisma.review.upsert({
                    where: { id: r.reviewId },
                    update: {
                        reviewerName: r.name || 'Anonymous',
                        reviewerPhotoUrl: r.reviewerPhotoUrl || null,
                        rating: r.stars || 0,
                        text: r.text || null,
                        textTranslated: r.textTranslated || null,
                        publishedAtText: r.publishAt || null,
                        originalLanguage: r.originalLanguage || null
                    },
                    create: {
                        id: r.reviewId,
                        businessId: business.id,
                        reviewerName: r.name || 'Anonymous',
                        reviewerPhotoUrl: r.reviewerPhotoUrl || null,
                        rating: r.stars || 0,
                        text: r.text || null,
                        textTranslated: r.textTranslated || null,
                        publishedAtText: r.publishAt || null,
                        originalLanguage: r.originalLanguage || null
                    }
                });
                reviewsUpsertsCount++;
            }
        }
    }

    console.log(`\n=========================================`);
    console.log(`🎉 SEEDING SUMMARY FOR BENI MELLAL`);
    console.log(`=========================================`);
    console.log(`Businesses Upserted:      ${businessUpsertsCount}`);
    console.log(`Reviews Upserted:         ${reviewsUpsertsCount}`);
    console.log(`=========================================`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
