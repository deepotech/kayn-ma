import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';

// PATCH /api/admin/reports/[id] - Take action on a reported listing
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();

        const { id } = params;
        const body = await request.json();
        const { action } = body; // 'dismiss' | 'hide' | 'delete'

        if (action === 'dismiss') {
            // Clear reports
            await Listing.findByIdAndUpdate(id, {
                $set: {
                    isReported: false,
                    reportsCount: 0,
                },
            });

            return NextResponse.json({ success: true, action: 'dismissed' });
        }

        if (action === 'hide') {
            // Hide the listing
            await Listing.findByIdAndUpdate(id, {
                $set: {
                    visibility: 'hidden',
                    isReported: false,
                },
            });

            return NextResponse.json({ success: true, action: 'hidden' });
        }

        if (action === 'delete') {
            await Listing.findByIdAndDelete(id);
            return NextResponse.json({ success: true, action: 'deleted' });
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        );
    } catch (error) {
        console.error('[Admin Report Action Error]', error);
        return NextResponse.json(
            { error: 'Failed to process report action' },
            { status: 500 }
        );
    }
}
