import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';
import { revalidatePath } from 'next/cache';

// PATCH /api/my-listings/[id]/status - Update listing status only
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        const { status, visibility, userId } = body;

        if (!id) {
            return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
        }

        await dbConnect();

        const existingListing = await Listing.findById(id);
        if (!existingListing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        // Verify ownership
        if (userId && existingListing.userId !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const updateData: any = { updatedAt: new Date() };

        if (status) {
            updateData.status = status;
            // If activating, update publishedAt
            if (status === 'approved' || status === 'active') {
                updateData.publishedAt = new Date();
            }
        }

        if (visibility) {
            updateData.visibility = visibility;
        }

        const updatedListing = await Listing.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        ).lean();

        // Revalidate paths
        ['ar', 'fr'].forEach(locale => {
            revalidatePath(`/${locale}`);
            revalidatePath(`/${locale}/cars`);
            revalidatePath(`/${locale}/dashboard/listings`);
        });

        return NextResponse.json({ success: true, data: updatedListing });
    } catch (error) {
        console.error('Error updating listing status:', error);
        return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }
}
