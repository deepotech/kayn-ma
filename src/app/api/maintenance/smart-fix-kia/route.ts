import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';

export const dynamic = 'force-dynamic';

export async function GET() {
    await dbConnect();

    // Find listings with unknown body type
    const collection = Listing.collection; // use raw collection for speed
    const listings = await collection.find({
        $or: [{ bodyTypeSlug: 'unknown' }, { bodyTypeSlug: { $exists: false } }]
    }).toArray();

    const logs = [];
    let updatedCount = 0;

    for (const listing of listings) {
        let newBodyType = null;
        let newBodyTypeSlug = null;

        const text = (listing.title + ' ' + (listing.description || '')).toLowerCase();

        // Heuristic Rules
        if (text.includes('berline') || text.includes('accent') || text.includes('optima') || text.includes('logan') || text.includes('sedan')) {
            newBodyType = 'Sedan';
            newBodyTypeSlug = 'sedan';
        } else if (text.includes('k2500') || text.includes('pickup') || text.includes('honda') || text.includes('peugeot partner')) {
            // General catch-all for utility vehicles if needed, or map specifically
            // For K2500, it's a Truck/Pickup. Let's assume 'Truck' or 'Pickup' if valid.
            // Checking constants... usually 'truck' or 'pickup'. Let's use 'truck' for now or 'other'
            newBodyType = 'Truck';
            newBodyTypeSlug = 'truck';
        }

        if (newBodyType) {
            await collection.updateOne(
                { _id: listing._id },
                { $set: { bodyType: newBodyType, bodyTypeSlug: newBodyTypeSlug } }
            );
            logs.push(`Fixed ${listing.title}: Set to ${newBodyType} (${newBodyTypeSlug})`);
            updatedCount++;
        } else {
            logs.push(`Could not infer body type for: ${listing.title}`);
        }
    }

    return NextResponse.json({
        success: true,
        updatedCount,
        logs
    });
}
