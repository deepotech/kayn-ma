require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const cleanedFile = path.join(__dirname, '../src/data/safi.json');

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
        result += mapping[char] !== undefined ? mapping[char] : char;
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
    console.log('🚀 Starting database seeding for Safi...');

    if (!fs.existsSync(cleanedFile)) {
        console.error('❌ Cleaned data file not found. Run clean-safi-data.js first.');
        process.exit(1);
    }

    const items = JSON.parse(fs.readFileSync(cleanedFile, 'utf8'));
    console.log(`Loaded ${items.length} businesses for seeding.`);

    // Upsert City
    console.log('Upserting City: safi');
    const city = await prisma.city.upsert({
        where: { slug: 'safi' },
        update: { name: 'Safi', lat: 32.2994, lng: -9.2372 },
        create: { name: 'Safi', slug: 'safi', lat: 32.2994, lng: -9.2372 }
    });
    console.log(`✅ City upserted (ID: ${city.id})`);

    // Ensure categories exist
    const categoryNames = ['Car Rental Agency', 'Used Car Dealer'];
    const categoryMap = {};
    for (const name of categoryNames) {
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        const cat = await prisma.category.upsert({
            where: { slug },
            update: { name },
            create: { name, slug }
        });
        categoryMap[name] = cat.id;
    }
    console.log('✅ Categories ensured in database');

    let businessUpsertsCount = 0;
    let reviewsUpsertsCount = 0;

    for (const item of items) {
        const slug = `${slugify(item.title)}-safi`;
        const arabicCategoryName = item.categories[0];
        const englishCategoryName = CATEGORY_MAP[arabicCategoryName];
        const categoryId = categoryMap[englishCategoryName];

        if (!categoryId) {
            console.warn(`⚠️ Skipping ${item.title}: unknown category ${arabicCategoryName}`);
            continue;
        }

        const rating = item.totalScore || calculateRating(item.reviews) || 0;
        const reviewsCount = item.reviewsCount || (item.reviews ? item.reviews.length : 0);

        console.log(`Upserting Business: ${item.title} (${slug})`);

        const business = await prisma.business.upsert({
            where: { slug },
            update: {
                name: item.title,
                address: item.address || 'آسفي، المغرب',
                phone: item.phone || null,
                website: item.website || null,
                lat: item.location?.lat || null,
                lng: item.location?.lng || null,
                rating: rating,
                reviewsCount: reviewsCount,
                photos: item.imageUrls || item.photos || [],
                source: 'google_maps',
                openingHours: item.openingHours || [],
                categories: {
                    deleteMany: {},
                    create: [{ categoryId }]
                }
            },
            create: {
                name: item.title,
                slug,
                city: { connect: { id: city.id } },
                address: item.address || 'آسفي، المغرب',
                phone: item.phone || null,
                website: item.website || null,
                lat: item.location?.lat || null,
                lng: item.location?.lng || null,
                rating: rating,
                reviewsCount: reviewsCount,
                photos: item.imageUrls || item.photos || [],
                source: 'google_maps',
                openingHours: item.openingHours || [],
                categories: {
                    create: [{ categoryId }]
                }
            }
        });
        businessUpsertsCount++;

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
    console.log(`🎉 SEEDING SUMMARY FOR SAFI`);
    console.log(`=========================================`);
    console.log(`Businesses Upserted:      ${businessUpsertsCount}`);
    console.log(`Reviews Upserted:         ${reviewsUpsertsCount}`);
    console.log(`=========================================`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
