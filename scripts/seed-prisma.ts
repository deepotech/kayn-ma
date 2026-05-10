import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

const DATA_DIR = path.join(process.cwd(), 'src', 'data');

const CATEGORY_MAP: Record<string, string> = {
    'car rental agency': 'Car Rental Agency',
    'car rental': 'Car Rental Agency',
    'rent a car': 'Car Rental Agency',
    'vehicle rental': 'Car Rental Agency',
    'auto rental': 'Car Rental Agency',
    'used car dealer': 'Used Car Dealer',
    'used car dealership': 'Used Car Dealer',
    'car dealer': 'Used Car Dealer',
    'auto dealer': 'Used Car Dealer',
    'car dealership': 'Used Car Dealer',
    'وكالة تأجير السيارات': 'Car Rental Agency',
    'تأجير سيارات': 'Car Rental Agency',
    'كراء السيارات': 'Car Rental Agency',
    'بيع السيارات المستعملة': 'Used Car Dealer',
    'تاجر سيارات مستعملة': 'Used Car Dealer',
    'معرض سيارات': 'Used Car Dealer',
};

const VALID_CATEGORIES = ['Car Rental Agency', 'Used Car Dealer'];

function generateSlug(name: string, city: string): string {
    const cleanName = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

    const cleanCity = city.toLowerCase().replace(/\s+/g, '-');
    return `${cleanName}-${cleanCity}`.slice(0, 100);
}

function normalizeCategory(categoryName: string): string | null {
    if (!categoryName) return null;
    const normalized = categoryName.toLowerCase().trim();

    if (CATEGORY_MAP[normalized]) {
        return CATEGORY_MAP[normalized];
    }

    for (const [key, value] of Object.entries(CATEGORY_MAP)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return value;
        }
    }

    return null;
}

function calculateRating(reviews: any[]): number | null {
    if (!reviews || reviews.length === 0) return null;

    const validReviews = reviews.filter(r => r.stars && typeof r.stars === 'number');
    if (validReviews.length === 0) return null;

    const sum = validReviews.reduce((acc, r) => acc + r.stars, 0);
    return Math.round((sum / validReviews.length) * 10) / 10;
}

async function main() {
    console.log('🚀 Starting Universal Prisma Seed...');

    // 1. Ensure Valid Categories exist in Prisma
    const categoryRecords: Record<string, string> = {};
    for (const catName of VALID_CATEGORIES) {
        const catSlug = catName.toLowerCase().replace(/\s+/g, '-');
        const cat = await prisma.category.upsert({
            where: { name: catName },
            update: { slug: catSlug },
            create: { name: catName, slug: catSlug }
        });
        categoryRecords[catName] = cat.id;
    }

    // 2. Read all JSON files in src/data
    const files = fs.readdirSync(DATA_DIR).filter(file => file.endsWith('.json') && !file.includes('cleaned'));
    console.log(`📂 Found ${files.length} city data files to process.`);

    for (const file of files) {
        const citySlug = file.replace('.json', '');
        console.log(`\n===========================================`);
        console.log(`🏙️  Processing City: ${citySlug}`);

        const dataPath = path.join(DATA_DIR, file);
        const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

        // Upsert City
        const cityName = citySlug.charAt(0).toUpperCase() + citySlug.slice(1);
        const cityRecord = await prisma.city.upsert({
            where: { slug: citySlug },
            update: {},
            create: { name: cityName, slug: citySlug }
        });

        const seenPlaceIds = new Set<string>();
        const seenNames = new Set<string>();
        let processedCount = 0;
        let skippedCount = 0;

        const validAgencies = [];
        for (const agency of rawData) {
            // Validate
            if (!agency.phone) { skippedCount++; continue; }
            if (!agency.categoryName && (!agency.categories || agency.categories.length === 0)) { skippedCount++; continue; }
            if (agency.placeId && seenPlaceIds.has(agency.placeId)) { skippedCount++; continue; }

            const normalizedName = agency.title?.toLowerCase().trim();
            if (!normalizedName || seenNames.has(normalizedName)) { skippedCount++; continue; }

            const primaryCategory = agency.categoryName || agency.categories[0];
            const normalizedCategory = normalizeCategory(primaryCategory);

            if (!normalizedCategory || !VALID_CATEGORIES.includes(normalizedCategory)) {
                skippedCount++;
                continue;
            }

            if (agency.placeId) seenPlaceIds.add(agency.placeId);
            seenNames.add(normalizedName);
            
            validAgencies.push({ agency, normalizedCategory });
        }

        const chunkedAgencies = [];
        const chunkSize = 50;
        for (let i = 0; i < validAgencies.length; i += chunkSize) {
            chunkedAgencies.push(validAgencies.slice(i, i + chunkSize));
        }

        for (const chunk of chunkedAgencies) {
            await Promise.all(chunk.map(async ({ agency, normalizedCategory }) => {
                const agencySlug = generateSlug(agency.title, citySlug);
                const rating = calculateRating(agency.reviews || []);
                const reviewsCount = agency.reviews?.length || 0;
                const photos = agency.imageUrls || (agency.imageUrl ? [agency.imageUrl] : []);

                try {
                    const business = await prisma.business.upsert({
                        where: { slug: agencySlug },
                        update: {
                            name: agency.title.trim(),
                            address: agency.address || '',
                            phone: agency.phone?.replace(/\s+/g, ' ').trim() || null,
                            website: agency.website || null,
                            lat: agency.location?.lat,
                            lng: agency.location?.lng,
                            rating: rating,
                            reviewsCount: reviewsCount,
                            photos: photos,
                            cityId: cityRecord.id
                        },
                        create: {
                            slug: agencySlug,
                            name: agency.title.trim(),
                            address: agency.address || '',
                            phone: agency.phone?.replace(/\s+/g, ' ').trim() || null,
                            website: agency.website || null,
                            lat: agency.location?.lat,
                            lng: agency.location?.lng,
                            rating: rating,
                            reviewsCount: reviewsCount,
                            photos: photos,
                            cityId: cityRecord.id,
                            source: 'apify',
                            status: 'active'
                        }
                    });

                    const catId = categoryRecords[normalizedCategory];
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
                    processedCount++;
                } catch (err) {
                    console.error(`❌ Error upserting agency ${agency.title}:`, err);
                }
            }));
        }

        console.log(`✅ ${citySlug}: Upserted ${processedCount} agencies (Skipped: ${skippedCount})`);
    }

    console.log('\n🎉 All cities processed successfully!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
