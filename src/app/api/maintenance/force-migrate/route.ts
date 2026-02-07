import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';

// Helper to normalize slugs
const slugify = (text: string) => {
    if (!text) return 'unknown';
    return text.toString().toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
};

export async function GET() {
    try {
        await dbConnect();

        // Use raw collection to bypass any strict schema/validation issues during hot-reload
        const collection = Listing.collection;
        const listings = await collection.find({}).toArray();

        let updatedCount = 0;
        const logs: string[] = [];

        logs.push(`Found ${listings.length} listings in collection: ${collection.collectionName}`);

        for (const listing of listings) {
            const updateData: any = {};
            let needsUpdate = false;

            // Generate slugs if they are missing
            if (!listing.brandSlug) {
                updateData.brandSlug = slugify(listing.brandCustom || listing.brand || 'unknown');
                needsUpdate = true;
            }

            if (!listing.modelSlug) {
                updateData.modelSlug = slugify(listing.modelCustom || listing.carModel || 'unknown');
                needsUpdate = true;
            }

            if (!listing.bodyTypeSlug) {
                updateData.bodyTypeSlug = slugify(listing.bodyType || 'unknown');
                needsUpdate = true;
            }

            if (needsUpdate) {
                const result = await collection.updateOne(
                    { _id: listing._id },
                    { $set: updateData }
                );
                logs.push(`Updated ${listing._id} (${listing.title}): matched=${result.matchedCount}, modified=${result.modifiedCount}, data=${JSON.stringify(updateData)}`);
                if (result.modifiedCount > 0) updatedCount++;
            } else {
                logs.push(`Skipped ${listing._id} (${listing.title}): Already has slugs.`);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Force Migration completed. Scanned ${listings.length}. Updated ${updatedCount}.`,
            updatedCount,
            logs
        });

    } catch (error: any) {
        console.error('Force Migration failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
