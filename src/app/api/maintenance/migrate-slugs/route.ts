export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Types } from 'mongoose';
import Listing from '@/models/Listing';

interface LegacyListingRecord {
    _id: Types.ObjectId;
    brandSlug?: string;
    brandCustom?: string;
    brand?: { label?: string; slug?: string } | string;
    modelSlug?: string;
    modelCustom?: string;
    carModel?: { label?: string; slug?: string } | string;
    bodyTypeSlug?: string;
    bodyType?: { label?: string; slug?: string } | string;
}

// Helper to normalize slugs
const slugify = (text: unknown) => {
    if (!text) return 'unknown';
    if (typeof text === 'object' && text !== null && 'slug' in text) {
        return String((text as { slug?: string }).slug || 'unknown');
    }
    return String(text).toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-');  // Replace multiple - with single -
};

export async function GET() {
    try {
        await dbConnect();

        // 1. Find all listings that might need migration (missing slugs)
        // We check if brandSlug is missing OR bodyTypeSlug is missing
        const listings = await Listing.find({
            $or: [
                { brandSlug: { $exists: false } },
                { brandSlug: null },
                { brandSlug: "" },
                { bodyTypeSlug: { $exists: false } }
            ]
        });

        let updatedCount = 0;
        const updates = [];

        for (const listing of (listings as unknown as LegacyListingRecord[])) {
            let needsUpdate = false;
            const updateData: Record<string, unknown> = {};

            // Helper to check and set slug
            if (!listing.brandSlug) {
                updateData.brandSlug = slugify(listing.brandCustom || listing.brand);
                needsUpdate = true;
            }

            if (!listing.modelSlug) {
                updateData.modelSlug = slugify(listing.modelCustom || listing.carModel);
                needsUpdate = true;
            }

            if (!listing.bodyTypeSlug) {
                updateData.bodyTypeSlug = slugify(listing.bodyType);
                needsUpdate = true;
            }

            if (needsUpdate) {
                // We use updateOne to avoid validating other fields that might be strict
                updates.push(Listing.updateOne({ _id: listing._id }, { $set: updateData }));
                updatedCount++;
            }
        }

        // Execute all updates in parallel
        await Promise.all(updates);

        return NextResponse.json({
            success: true,
            message: `Migration completed. Scanned ${listings.length} listings. Updated ${updatedCount}.`,
            updatedCount
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Migration failed';
        console.error('Migration failed:', error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
