import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';
import { revalidatePath } from 'next/cache';

// Helper to revalidate paths
const revalidateListingPaths = (id: string) => {
    ['ar', 'fr'].forEach(locale => {
        revalidatePath(`/${locale}`);
        revalidatePath(`/${locale}/cars`);
        revalidatePath(`/${locale}/dashboard/listings`);
        revalidatePath(`/${locale}/cars/${id}`);
    });
};

// GET /api/my-listings/[id] - Get single listing
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

        return NextResponse.json(listing);
    } catch (error) {
        console.error('Error fetching listing:', error);
        return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 });
    }
}

// PATCH /api/my-listings/[id] - Update listing
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
        }

        await dbConnect();

        // Check listing exists
        const existingListing = await Listing.findById(id);
        if (!existingListing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        // Verify ownership if userId provided
        if (body.userId && existingListing.userId !== body.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Remove userId from update data
        const { userId, ...updateData } = body;
        updateData.updatedAt = new Date();

        const updatedListing = await Listing.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean();

        revalidateListingPaths(id);

        return NextResponse.json({ success: true, data: updatedListing });
    } catch (error) {
        console.error('Error updating listing:', error);
        return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
    }
}

// DELETE /api/my-listings/[id] - Delete listing
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!id) {
            return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
        }

        await dbConnect();

        const existingListing = await Listing.findById(id);
        if (!existingListing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        // Verify ownership if userId provided
        if (userId && existingListing.userId !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await Listing.findByIdAndDelete(id);

        revalidateListingPaths(id);

        return NextResponse.json({ success: true, message: 'Listing deleted' });
    } catch (error) {
        console.error('Error deleting listing:', error);
        return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
    }
}
