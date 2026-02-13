export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RentAgency from '@/models/RentAgency';
import fs from 'fs';
import path from 'path';

// Category normalization mapping
const CATEGORY_MAP: Record<string, string> = {
    // English variations
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

    // Arabic variations
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

export async function GET(req: NextRequest) {
    // SECURITY: Block in production
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
            { success: false, error: 'Seed endpoint is disabled in production.' },
            { status: 403 }
        );
    }

    // SECURITY: Require secret token
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    if (process.env.SEED_SECRET && token !== process.env.SEED_SECRET) {
        return NextResponse.json(
            { success: false, error: 'Invalid or missing seed token.' },
            { status: 401 }
        );
    }

    const dryRun = searchParams.get('dry') === 'true';
    const clearExisting = searchParams.get('clear') === 'true';

    try {
        // Read raw data from file
        const dataPath = path.join(process.cwd(), 'src', 'data', 'rabat.json');

        if (!fs.existsSync(dataPath)) {
            return NextResponse.json({
                success: false,
                error: 'rabat.json not found in src/data/'
            }, { status: 404 });
        }

        const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

        const seenPlaceIds = new Set<string>();
        const seenNames = new Set<string>();
        const agencies: any[] = [];

        let stats = {
            total: rawData.length,
            skippedNoPhone: 0,
            skippedNoCategory: 0,
            skippedDuplicate: 0,
            skippedInvalidCategory: 0,
            valid: 0,
        };

        for (const agency of rawData) {
            // Skip if no phone
            if (!agency.phone) {
                stats.skippedNoPhone++;
                continue;
            }

            // Skip if no category
            if (!agency.categoryName && (!agency.categories || agency.categories.length === 0)) {
                stats.skippedNoCategory++;
                continue;
            }

            // Deduplicate by placeId
            if (agency.placeId && seenPlaceIds.has(agency.placeId)) {
                stats.skippedDuplicate++;
                continue;
            }

            // Deduplicate by name
            const normalizedName = agency.title.toLowerCase().trim();
            if (seenNames.has(normalizedName)) {
                stats.skippedDuplicate++;
                continue;
            }

            // Normalize category
            const primaryCategory = agency.categoryName || agency.categories[0];
            const normalizedCategory = normalizeCategory(primaryCategory);

            if (!normalizedCategory || !VALID_CATEGORIES.includes(normalizedCategory)) {
                stats.skippedInvalidCategory++;
                continue;
            }

            // Mark as seen
            if (agency.placeId) seenPlaceIds.add(agency.placeId);
            seenNames.add(normalizedName);

            // Build cleaned entry
            agencies.push({
                name: agency.title.trim(),
                slug: generateSlug(agency.title, 'rabat'),
                city: 'rabat',
                address: agency.address || '',
                phone: agency.phone?.replace(/\s+/g, ' ').trim() || null,
                website: agency.website || null,
                location: agency.location,
                categories: [normalizedCategory],
                rating: calculateRating(agency.reviews || []),
                reviewsCount: agency.reviews?.length || 0,
                photos: agency.imageUrls || (agency.imageUrl ? [agency.imageUrl] : []),
                source: 'apify',
                status: 'active',
                claimed: false,
            });
        }

        stats.valid = agencies.length;

        // Category breakdown
        const categoryBreakdown: Record<string, number> = {};
        for (const agency of agencies) {
            const cat = agency.categories[0];
            categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
        }

        if (dryRun) {
            return NextResponse.json({
                success: true,
                dryRun: true,
                stats,
                categoryBreakdown,
                sampleAgencies: agencies.slice(0, 5),
            });
        }

        // Actually seed to database
        await dbConnect();

        if (clearExisting) {
            const deleted = await RentAgency.deleteMany({ city: 'rabat' });
            console.log(`[Seed Rabat] Cleared ${deleted.deletedCount} existing Rabat agencies`);
        }

        // Use bulkWrite with upsert for idempotent seeding
        const operations = agencies.map(agency => ({
            updateOne: {
                filter: { slug: agency.slug },
                update: { $set: agency },
                upsert: true
            }
        }));

        const result = await RentAgency.bulkWrite(operations);

        return NextResponse.json({
            success: true,
            stats,
            categoryBreakdown,
            dbResult: {
                upserted: result.upsertedCount,
                modified: result.modifiedCount,
                matched: result.matchedCount,
            },
            message: `Seeded ${agencies.length} Rabat agencies successfully!`
        });

    } catch (error) {
        console.error('[Seed Rabat] Error:', error);
        return NextResponse.json({
            success: false,
            error: (error as Error).message
        }, { status: 500 });
    }
}
