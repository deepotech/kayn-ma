import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';

// PATCH /api/admin/listings/[id]/status
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();

        const { id } = params;
        const body = await request.json();
        const { status, visibility, rejectionReason } = body;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {
            lastModeratedAt: new Date(),
        };

        if (status) {
            updateData.status = status;
            if (status === 'approved') {
                updateData.publishedAt = new Date();
            }
        }

        if (visibility) {
            updateData.visibility = visibility;
        }

        if (rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        }

        const listing = await Listing.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        ).lean();

        if (!listing) {
            return NextResponse.json(
                { error: 'Listing not found' },
                { status: 404 }
            );
        }

        console.log(`[Admin] Listing ${id} updated:`, updateData);

        return NextResponse.json({
            success: true,
            listing: {
                ...listing,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                _id: (listing as any)._id.toString(),
            },
        });
    } catch (error) {
        console.error('[Admin Listing Status Error]', error);
        return NextResponse.json(
            { error: 'Failed to update listing status' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/listings/[id]/status (or use for delete)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();

        const { id } = params;

        const result = await Listing.findByIdAndDelete(id);

        if (!result) {
            return NextResponse.json(
                { error: 'Listing not found' },
                { status: 404 }
            );
        }

        console.log(`[Admin] Listing ${id} deleted`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Admin Listing Delete Error]', error);
        return NextResponse.json(
            { error: 'Failed to delete listing' },
            { status: 500 }
        );
    }
}
