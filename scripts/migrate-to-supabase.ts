import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DIRECT_URL
        }
    }
});

async function migrate() {
    console.log("🚀 Starting Full Migration from MongoDB to Supabase PostgreSQL");

    if (!process.env.MONGODB_URI) {
        console.error("❌ MONGODB_URI not found. Migration cannot proceed.");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");
    } catch (e) {
        console.error("❌ Failed to connect to MongoDB.", e);
        process.exit(1);
    }

    // 1. Migrate Users
    console.log("\n📦 Migrating Users...");
    const db = mongoose.connection.db;
    if (!db) throw new Error("Mongoose connection is missing the db object.");
    
    const users = await db.collection('users').find({}).toArray();
    for (const user of users) {
        await prisma.user.upsert({
            where: { firebaseUid: user.firebaseUid },
            update: {},
            create: {
                firebaseUid: user.firebaseUid,
                email: user.email,
                displayName: user.displayName || null,
                role: user.role || 'user',
                isBanned: user.isBanned || false,
                banReason: user.banReason || null,
                bannedUntil: user.bannedUntil ? new Date(user.bannedUntil) : null,
                createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
                updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
            }
        });
    }
    console.log(`✅ Migrated ${users.length} users.`);

    // 2. Migrate Categories and Cities (assuming from RentAgencies or independent JSON)
    console.log("\n📦 Migrating Cities and Categories from RentAgencies...");
    const agencies = await db.collection('rentagencies').find({}).toArray();
    const categoryMap = new Map<string, string>();
    const cityMap = new Map<string, string>();

    // Pass 1: Create distinct cities and categories
    for (const agency of agencies) {
        // City
        if (agency.city && !cityMap.has(agency.city.toLowerCase())) {
            const slug = agency.city.toLowerCase();
            const createdCity = await prisma.city.upsert({
                where: { slug },
                update: {},
                create: {
                    name: agency.city,
                    slug,
                    lat: agency.location?.lat || 0,
                    lng: agency.location?.lng || 0,
                }
            });
            cityMap.set(slug, createdCity.id);
        }

        // Categories
        const cats = agency.categories || [];
        for (const cat of cats) {
            if (!categoryMap.has(cat)) {
                const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const createdCat = await prisma.category.upsert({
                    where: { name: cat },
                    update: {},
                    create: { name: cat, slug: `${slug}-${Math.random().toString(36).substring(2, 6)}` }
                });
                categoryMap.set(cat, createdCat.id);
            }
        }
    }

    // Pass 2: Insert RentAgencies into Business
    console.log(`📦 Migrating ${agencies.length} RentAgencies to Businesses...`);
    for (const agency of agencies) {
        const cityId = cityMap.get(agency.city?.toLowerCase());
        if (!cityId) continue;

        const business = await prisma.business.upsert({
            where: { slug: agency.slug },
            update: {},
            create: {
                name: agency.name,
                slug: agency.slug,
                cityId,
                address: agency.address || '',
                phone: agency.phone || null,
                website: agency.website || null,
                lat: agency.location?.lat,
                lng: agency.location?.lng,
                rating: agency.rating || 0,
                reviewsCount: agency.reviewsCount || 0,
                photos: agency.photos || [],
                source: agency.source || 'apify',
                status: agency.status || 'active',
                claimed: agency.claimed || false,
                openingHours: agency.openingHours ? JSON.parse(JSON.stringify(agency.openingHours)) : null,
                createdAt: agency.createdAt ? new Date(agency.createdAt) : new Date(),
                updatedAt: agency.updatedAt ? new Date(agency.updatedAt) : new Date(),
            }
        });

        // Link categories
        const cats = agency.categories || [];
        for (const cat of cats) {
            const catId = categoryMap.get(cat);
            if (catId) {
                await prisma.businessCategory.upsert({
                    where: { businessId_categoryId: { businessId: business.id, categoryId: catId } },
                    update: {},
                    create: { businessId: business.id, categoryId: catId }
                });
            }
        }

        // Migrate embedded reviews if they exist in agency.reviews
        if (agency.reviews && Array.isArray(agency.reviews)) {
            for (const r of agency.reviews.slice(0, 50)) { // Limit to 50 to prevent huge rows
                if (!r.text && !r.stars) continue;
                await prisma.review.create({
                    data: {
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
            }
        }
    }
    console.log(`✅ Migrated ${agencies.length} RentAgencies.`);

    // 3. Migrate Listings
    console.log("\n📦 Migrating Listings...");
    const listings = await db.collection('listings').find({}).toArray();
    for (const listing of listings) {
        try {
            // Need a city ID for the listing
            const citySlug = listing.city?.slug;
            let cityId = citySlug ? cityMap.get(citySlug) : null;
            if (!cityId && citySlug) {
                const c = await prisma.city.upsert({
                    where: { slug: citySlug },
                    update: {},
                    create: { name: listing.city.label, slug: citySlug }
                });
                cityId = c.id;
                cityMap.set(citySlug, cityId);
            }

            await prisma.listing.create({
                data: {
                    id: listing._id.toString(), // Preserve MongoDB ObjectId as string
                    purpose: listing.purpose || 'sale',
                    condition: listing.condition || 'used',
                    sellerType: listing.sellerType || 'individual',
                    title: listing.title,
                    description: listing.description || null,
                    price: listing.price,
                    currency: listing.currency || 'MAD',
                    brandLabel: listing.brand?.label || 'Unknown',
                    brandSlug: listing.brand?.slug || 'unknown',
                    carModelLabel: listing.carModel?.label || 'Unknown',
                    carModelSlug: listing.carModel?.slug || 'unknown',
                    bodyTypeLabel: listing.bodyType?.label || 'Unknown',
                    bodyTypeSlug: listing.bodyType?.slug || 'unknown',
                    cityId: cityId || (cityMap.values().next().value as string) || "UNKNOWN_CITY", // Fallback
                    year: listing.year,
                    mileage: listing.mileage || 0,
                    fuelType: listing.fuelType || 'Petrol',
                    transmission: listing.transmission || 'Manual',
                    images: listing.images || [],
                    status: listing.status || 'approved',
                    visibility: listing.visibility || 'public',
                    phone: listing.phone || '',
                    whatsapp: listing.whatsapp || null,
                    userId: listing.userId || null,
                    createdAt: listing.createdAt ? new Date(listing.createdAt) : new Date(),
                    updatedAt: listing.updatedAt ? new Date(listing.updatedAt) : new Date(),
                    publishedAt: listing.publishedAt ? new Date(listing.publishedAt) : null,
                }
            });
        } catch (err) {
            console.error(`Skipping listing ${listing._id} due to error`, err);
        }
    }
    console.log(`✅ Migrated ${listings.length} Listings.`);

    console.log("🎉 All MongoDB collections migrated successfully.");
}

migrate()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });
