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

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();

        const mongoose = require('mongoose');
        const readyState = mongoose.connection.readyState;
        const count = await Listing.countDocuments({});

        const logs: string[] = [];
        logs.push(`DB State: ${readyState} (1=connected)`);
        logs.push(`Total Docs in DB: ${count}`);

        const listings = await Listing.find({}).lean();
        logs.push(`Found ${listings.length} listings via Mongoose.`);

        const collection = Listing.collection;
        let updatedCount = 0;

        for (const listing of listings) {
            const currentSlug = (listing as any).bodyTypeSlug;
            const correctSlug = slugify((listing as any).bodyType || 'unknown');

            if (currentSlug !== correctSlug) {
                const result = await collection.updateOne(
                    { _id: listing._id },
                    { $set: { bodyTypeSlug: correctSlug } }
                );
                logs.push(`Updated ${listing.title} (${listing._id}): '${currentSlug}' -> '${correctSlug}'`);
                if (result.modifiedCount > 0) updatedCount++;
            } else {
                logs.push(`Skipped ${listing.title} (${listing._id}): '${currentSlug}' === '${correctSlug}'`);
            }
        }

        return NextResponse.json({
            success: true,
            updatedCount,
            logs
        });

    } catch (e: any) {
        return NextResponse.json({
            success: false,
            error: e.message,
            stack: e.stack
        }, { status: 500 });
    }
}
