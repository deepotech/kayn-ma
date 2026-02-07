import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';
import { revalidatePath } from 'next/cache';

// GET /api/listings/[id] - Get a specific listing by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
        }

        await dbConnect();
        const listing = await Listing.findById(id).lean();

        if (!listing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: listing });
    } catch (error) {
        console.error('Error fetching listing:', error);
        return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 });
    }
}

// Helper to revalidate all necessary paths
const revalidateListingPaths = (listingId: string) => {
    // Revalidate for both locales to be safe
    ['ar', 'fr'].forEach(locale => {
        revalidatePath(`/${locale}`);
        revalidatePath(`/${locale}/cars`);
        revalidatePath(`/${locale}/my-listings`);
        revalidatePath(`/${locale}/cars/${listingId}`);
    });
};

// PUT /api/listings/[id] - Update a listing (Status or Details)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await dbConnect();

        // Check ownership
        const existingListing = await Listing.findById(id);
        if (!existingListing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        // Verify owner (In a real app, verify with session/token too)
        if (body.userId && existingListing.userId !== body.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const updateData: any = { updatedAt: new Date() };

        // Handle Status Change Specifically
        if (body.status) {
            updateData.status = body.status;

            // If resuming, update publishedAt
            if (body.status === 'active' || body.status === 'published' || body.status === 'approved') {
                updateData.publishedAt = new Date();
                updateData.status = 'approved'; // Enforce 'approved' as per schema
            }
        }

        // Handle other allowed updates (sanitized)
        const allowedUpdates = ['title', 'price', 'description', 'images', 'sold'];
        allowedUpdates.forEach(key => {
            if (body[key] !== undefined) updateData[key] = body[key];
        });

        // Use findByIdAndUpdate which triggers atomic operator $set by default in Mongoose if passed object
        // But let's be explicit to avoid accidental replacement if not careful
        const updatedListing = await Listing.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        // Revalidate cache
        revalidateListingPaths(id);

        return NextResponse.json({ success: true, data: updatedListing });
    } catch (error) {
        console.error('Error updating listing:', error);
        return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
    }
}

// DELETE /api/listings/[id] - Delete a listing
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await dbConnect();

        const existingListing = await Listing.findById(id);
        if (!existingListing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        // Verify owner
        if (userId && existingListing.userId !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await Listing.findByIdAndDelete(id);

        // Revalidate cache
        revalidateListingPaths(id);

        return NextResponse.json({ success: true, message: 'Listing deleted' });
    } catch (error) {
        console.error('Error deleting listing:', error);
        return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
    }
}
