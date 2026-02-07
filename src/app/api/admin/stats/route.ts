export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';
import User from '@/models/User';

// GET /api/admin/stats
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Run all queries in parallel
        const [
            totalListings,
            pendingListings,
            approvedListings,
            rejectedListings,
            totalUsers,
            bannedUsers,
            reportedListings,
        ] = await Promise.all([
            Listing.countDocuments(),
            Listing.countDocuments({ status: 'pending_review' }),
            Listing.countDocuments({ status: 'approved' }),
            Listing.countDocuments({ status: 'rejected' }),
            User.countDocuments(),
            User.countDocuments({ isBanned: true }),
            Listing.countDocuments({ isReported: true }),
        ]);

        const stats = {
            totalListings,
            pendingListings,
            approvedListings,
            rejectedListings,
            totalUsers,
            bannedUsers,
            reportsCount: reportedListings,
            reportsPending: reportedListings,
        };

        console.log('[Admin Stats]', stats);

        return NextResponse.json(stats);
    } catch (error) {
        console.error('[Admin Stats Error]', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
