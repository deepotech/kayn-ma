export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/stats
export async function GET(request: NextRequest) {
    const authResult = await requireAdmin(request);
    if ('error' in authResult) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    try {
        const statsPromise = Promise.all([
            prisma.listing.count(),
            prisma.listing.count({ where: { status: 'pending_review' } }),
            prisma.listing.count({ where: { status: 'approved' } }),
            prisma.listing.count({ where: { status: 'rejected' } }),
            prisma.user.count(),
            prisma.user.count({ where: { isBanned: true } }),
            prisma.listing.count({ where: { isReported: true } }),
        ]);

        let timerId: NodeJS.Timeout | undefined;
        const timeoutPromise = new Promise<never>((_, reject) => {
            timerId = setTimeout(() => {
                reject(new Error('ADMIN_STATS_TIMEOUT'));
            }, 8000);
            if (typeof timerId.unref === 'function') timerId.unref();
        });

        const [
            totalListings,
            pendingListings,
            approvedListings,
            rejectedListings,
            totalUsers,
            bannedUsers,
            reportedListings,
        ] = await Promise.race([statsPromise, timeoutPromise]).finally(() => {
            if (timerId) clearTimeout(timerId);
        });

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

        return NextResponse.json(stats);
    } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Admin Stats Error]', errMessage);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
